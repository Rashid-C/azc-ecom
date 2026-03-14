'use client'

import type { KeyboardEvent } from 'react'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowUpRight,
  Bot,
  LoaderCircle,
  MessageSquare,
  SendHorizonal,
  Sparkles,
  Stars,
  X,
  Zap,
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
const QUICK_PROMPTS = [
  'Best Dahua monitor under AED 500',
  'Show CCTV cameras for office use',
  'Recommend a gaming monitor',
]

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
    document.body.classList.toggle('ai-chat-open', isOpen)

    return () => {
      document.body.classList.remove('ai-chat-open')
    }
  }, [isOpen])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return
    viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' })
  }, [messages, products, isLoading])

  const conversationHistory = useMemo(() => messages.slice(1).slice(-10), [messages])

  async function submitMessage(rawMessage: string) {
    const trimmedInput = rawMessage.trim()
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

  function handleSubmit() {
    void submitMessage(input)
  }

  function handleQuickPrompt(prompt: string) {
    void submitMessage(prompt)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      handleSubmit()
    }
  }

  return (
    <div className='fixed right-3 bottom-3 z-[10000] sm:right-4 sm:bottom-4'>
      {isOpen ? (
        <div className='relative flex h-[min(78vh,42rem)] w-[min(calc(100vw-1rem),25rem)] flex-col overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white shadow-[0_28px_90px_rgba(15,23,42,0.28)] ring-1 ring-slate-950/5 backdrop-blur sm:w-[25rem]'>
          <div className='pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,#7dd3fc_0%,rgba(125,211,252,0.28)_32%,transparent_70%)] opacity-80' />

          <div className='relative overflow-hidden border-b border-slate-200/70 bg-[linear-gradient(145deg,#071120_0%,#10284a_45%,#0d4b77_100%)] px-4 py-4 text-white'>
            <div className='absolute -top-10 right-0 h-28 w-28 rounded-full bg-cyan-300/20 blur-2xl' />
            <div className='absolute bottom-0 left-6 h-16 w-16 rounded-full bg-sky-400/10 blur-2xl' />

            <div className='relative flex items-start justify-between gap-3'>
              <div className='min-w-0 space-y-3'>
                <div className='flex items-center gap-2'>
                  <div className='rounded-2xl bg-white/10 p-2 ring-1 ring-white/15 backdrop-blur'>
                    <Stars className='size-4 text-cyan-200' />
                  </div>
                  <Badge className='rounded-full border-0 bg-white/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-100 hover:bg-white/12'>
                    Live Catalog AI
                  </Badge>
                </div>
                <div>
                  <h3 className='text-lg font-semibold tracking-tight'>
                    AZC Shopping Assistant
                  </h3>
                  <p className='mt-1 max-w-[18rem] text-sm leading-5 text-white/78'>
                    Ask for product ideas, compare options, or find the best match
                    in your store inventory.
                  </p>
                </div>
                <div className='flex flex-wrap gap-2 text-xs text-cyan-100/90'>
                  <div className='rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10'>
                    Fast recommendations
                  </div>
                  <div className='rounded-full bg-white/10 px-3 py-1.5 ring-1 ring-white/10'>
                    Stock-aware answers
                  </div>
                </div>
              </div>

              <Button
                type='button'
                size='icon-sm'
                variant='ghost'
                className='shrink-0 rounded-full border border-white/10 bg-white/8 text-white hover:bg-white/14 hover:text-white'
                onClick={() => setIsOpen(false)}
                aria-label='Close AI assistant'
              >
                <X className='size-4' />
              </Button>
            </div>
          </div>

          <ScrollArea className='min-h-0 flex-1 bg-[linear-gradient(180deg,#f4fbff_0%,#ffffff_28%,#f8fafc_100%)]'>
            <div ref={viewportRef} className='space-y-5 p-4'>
              <div className='rounded-[1.35rem] border border-cyan-100 bg-white/85 p-3 shadow-[0_12px_28px_rgba(14,165,233,0.08)] backdrop-blur'>
                <div className='mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-sky-700'>
                  <Zap className='size-3.5' />
                  Quick Start
                </div>
                <div className='flex flex-wrap gap-2'>
                  {QUICK_PROMPTS.map((prompt) => (
                    <button
                      key={prompt}
                      type='button'
                      onClick={() => handleQuickPrompt(prompt)}
                      disabled={isLoading}
                      className='rounded-full border border-sky-200 bg-sky-50 px-3 py-2 text-left text-xs font-medium text-sky-900 transition hover:border-sky-300 hover:bg-sky-100 disabled:cursor-not-allowed disabled:opacity-60'
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <div className='mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#0f172a_0%,#0f4c81_100%)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.25)] sm:flex'>
                      <Bot className='size-4' />
                    </div>
                  )}

                  <div
                    className={cn(
                      'max-w-[90%] rounded-[1.4rem] px-4 py-3.5 text-sm shadow-sm',
                      message.role === 'user'
                        ? 'bg-[linear-gradient(145deg,#0f172a_0%,#2563eb_100%)] text-white shadow-[0_14px_28px_rgba(37,99,235,0.24)]'
                        : 'border border-slate-200/80 bg-white/90 text-slate-800 shadow-[0_12px_28px_rgba(15,23,42,0.06)] backdrop-blur'
                    )}
                  >
                    <div className='mb-2 flex items-center gap-2'>
                      <div
                        className={cn(
                          'text-[11px] font-semibold uppercase tracking-[0.18em]',
                          message.role === 'user' ? 'text-blue-100' : 'text-slate-500'
                        )}
                      >
                        {message.role === 'user' ? 'You' : 'Assistant'}
                      </div>
                    </div>
                    <p className='whitespace-pre-wrap leading-6'>{message.content}</p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className='flex justify-start gap-3'>
                  <div className='mt-1 hidden h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#0f172a_0%,#0f4c81_100%)] text-white shadow-[0_10px_24px_rgba(15,23,42,0.25)] sm:flex'>
                    <Sparkles className='size-4' />
                  </div>
                  <div className='flex items-center gap-2 rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 shadow-[0_12px_28px_rgba(15,23,42,0.06)]'>
                    <LoaderCircle className='size-4 animate-spin text-sky-600' />
                    Finding the best answer...
                  </div>
                </div>
              )}

              {products.length > 0 && (
                <div className='space-y-3'>
                  <div className='flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500'>
                    <Sparkles className='size-3.5 text-sky-600' />
                    Matched Products
                  </div>
                  {products.map((product) => (
                    <Link
                      key={product.id}
                      href={`/${locale}/product/${product.slug}`}
                      className='group block rounded-[1.4rem] border border-slate-200/80 bg-white/90 p-4 shadow-[0_14px_34px_rgba(15,23,42,0.06)] transition duration-200 hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-[0_18px_42px_rgba(14,165,233,0.15)]'
                      onClick={() => setIsOpen(false)}
                    >
                      <div className='flex items-start justify-between gap-3'>
                        <div className='min-w-0 space-y-1'>
                          <p className='truncate text-sm font-semibold text-slate-900 transition group-hover:text-sky-700'>
                            {product.name}
                          </p>
                          <p className='text-xs text-slate-500'>
                            {product.brand} | {product.category}
                          </p>
                        </div>
                        <Badge className='rounded-full border-0 bg-emerald-100 px-2.5 py-1 text-[11px] text-emerald-700 hover:bg-emerald-100'>
                          {product.countInStock > 0 ? 'In stock' : 'Out of stock'}
                        </Badge>
                      </div>

                      <div className='mt-4 flex items-center justify-between gap-3'>
                        <div>
                          <div className='text-base font-semibold text-slate-900'>
                            {formatCurrency(product.price)}
                          </div>
                          {product.listPrice > product.price && (
                            <div className='text-xs text-slate-400 line-through'>
                              {formatCurrency(product.listPrice)}
                            </div>
                          )}
                        </div>
                        <div className='text-right text-xs text-slate-500'>
                          <div>{product.avgRating}/5 rating</div>
                          <div>{product.numReviews} reviews</div>
                        </div>
                      </div>

                      <div className='mt-4 flex items-center justify-between text-xs font-medium text-sky-700'>
                        <span>Open product</span>
                        <ArrowUpRight className='size-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5' />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>

          <div className='border-t border-slate-200/80 bg-white/95 p-4 backdrop-blur'>
            {error && (
              <div className='mb-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-sm text-rose-700 shadow-sm'>
                {error}
              </div>
            )}

            <div className='rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,#ffffff_0%,#f8fafc_100%)] p-3 shadow-[0_12px_24px_rgba(15,23,42,0.05)]'>
              <Textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder='Ask about price, stock, best options, or compare products...'
                className='min-h-24 resize-none rounded-[1.1rem] border-0 bg-transparent px-2 py-2 text-sm shadow-none focus-visible:ring-0'
              />
              <div className='mt-2 flex items-center justify-between gap-3'>
                <p className='text-xs text-slate-500'>
                  Enter to send. Shift + Enter for a new line.
                </p>
                <Button
                  type='button'
                  onClick={handleSubmit}
                  disabled={isLoading || !input.trim()}
                  className='rounded-full bg-[linear-gradient(145deg,#0f172a_0%,#2563eb_100%)] px-5 text-white shadow-[0_14px_28px_rgba(37,99,235,0.22)] hover:text-white'
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
          className='group h-16 rounded-full border border-sky-300/40 bg-[linear-gradient(145deg,#071120_0%,#123966_52%,#2563eb_100%)] px-5 text-white shadow-[0_20px_45px_rgba(37,99,235,0.3)] hover:scale-[1.02] hover:text-white'
          aria-label='Open AI shopping assistant'
        >
          <div className='flex items-center gap-3'>
            <div className='rounded-full bg-white/10 p-2.5 ring-1 ring-white/15 backdrop-blur'>
              <MessageSquare className='size-5' />
            </div>
            <div className='text-left'>
              <div className='text-[11px] uppercase tracking-[0.24em] text-cyan-100'>
                AI Shopping Help
              </div>
              <div className='text-sm font-semibold'>Find the right product</div>
            </div>
          </div>
        </Button>
      )}
    </div>
  )
}
