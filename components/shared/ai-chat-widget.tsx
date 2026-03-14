'use client'

import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  Bot,
  LoaderCircle,
  MessageSquare,
  SendHorizonal,
  Sparkles,
  X,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Textarea } from '@/components/ui/textarea'
import { cn, formatCurrency } from '@/lib/utils'

type ChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

type SuggestedProduct = {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  price: number
  listPrice: number
  countInStock: number
  avgRating: number
  numReviews: number
}

type ChatApiResponse = {
  reply: string
  provider: 'openai' | 'openrouter' | 'fallback'
  usedFallback: boolean
  products: SuggestedProduct[]
}

type ChatApiError = {
  message?: string
}

const STORAGE_KEY = 'azc-ai-chat-widget'
const initialAssistantMessage: ChatMessage = {
  role: 'assistant',
  content:
    'Hello! I can help you find products, compare options, and answer catalog questions. What are you shopping for today?',
}

export default function AiChatWidget() {
  const params = useParams<{ locale?: string | string[] }>()
  const locale = Array.isArray(params?.locale)
    ? params.locale[0]
    : params?.locale || 'en'

  const [isOpen, setIsOpen] = useState(false)
  const [input, setInput] = useState('')
  const [messages, setMessages] = useState<ChatMessage[]>([initialAssistantMessage])
  const [products, setProducts] = useState<SuggestedProduct[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const viewportRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    try {
      const saved = window.sessionStorage.getItem(STORAGE_KEY)
      if (!saved) return

      const parsed = JSON.parse(saved) as {
        isOpen?: boolean
        messages?: ChatMessage[]
        products?: SuggestedProduct[]
      }

      if (parsed.isOpen) setIsOpen(true)
      if (Array.isArray(parsed.messages) && parsed.messages.length > 0) {
        setMessages(parsed.messages)
      }
      if (Array.isArray(parsed.products)) {
        setProducts(parsed.products)
      }
    } catch {
      window.sessionStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  useEffect(() => {
    const payload = JSON.stringify({ isOpen, messages, products })
    window.sessionStorage.setItem(STORAGE_KEY, payload)
  }, [isOpen, messages, products])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [messages, products, isLoading])

  const conversationHistory = useMemo(() => messages.slice(1).slice(-10), [messages])

  async function handleSubmit() {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    const nextUserMessage: ChatMessage = { role: 'user', content: trimmedInput }

    setMessages((current) => [...current, nextUserMessage])
    setInput('')
    setIsOpen(true)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmedInput,
          history: conversationHistory,
        }),
      })

      const data = (await response.json()) as ChatApiResponse | ChatApiError
      if (!response.ok || !('reply' in data)) {
        const errorMessage =
          'message' in data && typeof data.message === 'string'
            ? data.message
            : 'Unable to get a reply right now.'
        throw new Error(errorMessage)
      }

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: data.reply,
        },
      ])
      setProducts(data.products)
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to get a reply right now.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <div className='fixed right-4 bottom-3 z-[10000] sm:right-5 sm:bottom-3'>
      {isOpen ? (
        <div className='flex h-[min(70vh,38rem)] w-[min(calc(100vw-1.5rem),24rem)] flex-col overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.28)] ring-1 ring-black/5 sm:w-[24rem]'>
          <div className='bg-[linear-gradient(135deg,#081226_0%,#12294d_50%,#1b4d91_100%)] px-4 py-4 text-white'>
            <div className='flex items-start justify-between gap-3'>
              <div className='space-y-1'>
                <div className='flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-cyan-100/80'>
                  <Sparkles className='size-4' />
                  AZC AI Assistant
                </div>
                <p className='text-sm text-white/80'>
                  Ask for products, comparisons, or recommendations from your catalog.
                </p>
              </div>
              <Button
                type='button'
                size='icon-sm'
                variant='ghost'
                className='shrink-0 rounded-full text-white hover:bg-white/10 hover:text-white'
                onClick={() => setIsOpen(false)}
                aria-label='Close AI assistant'
              >
                <X className='size-4' />
              </Button>
            </div>
          </div>

          <ScrollArea className='min-h-0 flex-1 bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_30%)]'>
            <div ref={viewportRef} className='space-y-4 p-4'>
              <div className='rounded-2xl border border-cyan-100 bg-cyan-50/80 p-3 text-sm text-slate-700'>
                Try: &quot;Best Dahua monitor under AED 500&quot; or
                &quot;Show CCTV cameras for office use&quot;
              </div>

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    'flex',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                      message.role === 'user'
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 bg-white text-slate-800'
                    )}
                  >
                    {message.role === 'assistant' && (
                      <div className='mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500'>
                        <Bot className='size-3.5' />
                        Assistant
                      </div>
                    )}
                    <p className='whitespace-pre-wrap leading-6'>{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className='flex justify-start'>
                  <div className='flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-sm'>
                    <LoaderCircle className='size-4 animate-spin' />
                    Thinking...
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div className='space-y-3'>
                  <div className='text-xs font-semibold uppercase tracking-[0.2em] text-slate-500'>
                    Suggested Products
                  </div>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.slug}`}
                      className='block rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md'
                      onClick={() => setIsOpen(false)}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0 space-y-1'>
                          <p className='truncate text-sm font-semibold text-slate-900'>
                            {product.name}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {product.brand} | {product.category}
                          </p>
                        </div>
                        <Badge className='rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] text-emerald-700 hover:bg-emerald-100'>
                          {product.countInStock > 0 ? 'In stock' : 'Out of stock'}
                        </Badge>
                      </div>
                      <div className='mt-3 flex items-center justify-between text-sm'>
                        <span className='font-semibold text-slate-900'>
                          {formatCurrency(product.price)}
                        </span>
                        <span className='text-xs text-slate-500'>
                          {product.avgRating}/5 | {product.numReviews} reviews
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className='border-t border-slate-200 bg-white p-4'>
            {error && (
              <div className='mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700'>
                {error}
              </div>
            )}

            <div className='space-y-3'>
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask about products, price, stock, or recommendations...'
                className='min-h-24 resize-none rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-none focus-visible:border-slate-300 focus-visible:ring-slate-300/40'
              />
              <div className='flex items-center justify-between gap-3'>
                <p className='text-xs text-slate-500'>
                  Press Enter to send, Shift+Enter for a new line.
                </p>
                <Button
                  type='button'
                  onClick={() => void handleSubmit()}
                  disabled={isLoading || !input.trim()}
                  className='rounded-full px-5'
                >
                  {isLoading ? (
                    <LoaderCircle className='size-4 animate-spin' />
                  ) : (
                    <SendHorizonal className='size-4' />
                  )}
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <Button
          type='button'
          size='lg'
          onClick={() => setIsOpen(true)}
          className='group h-14 rounded-full bg-[linear-gradient(135deg,#0f172a_0%,#1d4ed8_100%)] px-5 text-white shadow-[0_18px_40px_rgba(29,78,216,0.35)] hover:scale-[1.02] hover:text-white'
          aria-label='Open AI shopping assistant'
        >
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-white/12 p-2'>
              <MessageSquare className='size-5' />
            </div>
            <div className='text-left'>
              <div className='text-xs uppercase tracking-[0.2em] text-cyan-100'>
                AI Help
              </div>
              <div className='text-sm font-semibold'>Ask about products</div>
            </div>
          </div>
        </Button>
      )}
    </div>
  )
}
