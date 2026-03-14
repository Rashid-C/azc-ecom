import Product from '@/lib/db/models/product.model'
import { formatCurrency } from '@/lib/utils'

export type AssistantChatMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AssistantProductMatch = {
  id: string
  name: string
  slug: string
  brand: string
  category: string
  description: string
  price: number
  listPrice: number
  countInStock: number
  avgRating: number
  numReviews: number
  tags: string[]
}

type ProviderResponse = {
  reply: string
  provider: 'openai' | 'openrouter' | 'fallback'
  usedFallback: boolean
}

const MAX_PRODUCTS = 5
const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'for',
  'from',
  'i',
  'in',
  'is',
  'me',
  'need',
  'of',
  'on',
  'or',
  'show',
  'the',
  'to',
  'want',
  'with',
])

function tokenizeQuery(message: string) {
  return message
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .map((term) => term.trim())
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term))
}

function uniqueById(products: AssistantProductMatch[]) {
  return Array.from(new Map(products.map((product) => [product.id, product])).values())
}

function normalizeProduct(doc: {
  _id: { toString(): string }
  name: string
  slug: string
  brand: string
  category: string
  description?: string
  price: number
  listPrice: number
  countInStock: number
  avgRating: number
  numReviews: number
  tags?: string[]
}): AssistantProductMatch {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    brand: doc.brand,
    category: doc.category,
    description: doc.description ?? '',
    price: doc.price,
    listPrice: doc.listPrice,
    countInStock: doc.countInStock,
    avgRating: doc.avgRating,
    numReviews: doc.numReviews,
    tags: doc.tags ?? [],
  }
}

export async function findRelevantProducts(message: string) {
  const trimmedMessage = message.trim()
  if (!trimmedMessage) return []

  const productFields =
    '_id name slug brand category description price listPrice countInStock avgRating numReviews tags'

  const textMatchesRaw = await Product.find(
    { $text: { $search: trimmedMessage }, isPublished: true },
    { score: { $meta: 'textScore' } }
  )
    .select(productFields)
    .sort({ score: { $meta: 'textScore' } })
    .limit(MAX_PRODUCTS)
    .lean()
    .catch(() => [])

  const terms = tokenizeQuery(trimmedMessage)
  const regexMatchesRaw =
    terms.length === 0
      ? []
      : await Product.find({
          isPublished: true,
          $or: [
            { name: { $regex: terms.join('|'), $options: 'i' } },
            { brand: { $regex: terms.join('|'), $options: 'i' } },
            { category: { $regex: terms.join('|'), $options: 'i' } },
            { tags: { $elemMatch: { $regex: terms.join('|'), $options: 'i' } } },
          ],
        })
          .select(productFields)
          .limit(MAX_PRODUCTS)
          .lean()
          .catch(() => [])

  return uniqueById(
    [...textMatchesRaw, ...regexMatchesRaw]
      .slice(0, MAX_PRODUCTS)
      .map((doc) => normalizeProduct(doc))
  )
}

function buildCatalogContext(products: AssistantProductMatch[]) {
  if (products.length === 0) {
    return 'No strongly matching products were found in the current catalog.'
  }

  return products
    .map((product, index) => {
      const stockText =
        product.countInStock > 0
          ? `${product.countInStock} in stock`
          : 'currently out of stock'

      return [
        `${index + 1}. ${product.name}`,
        `Brand: ${product.brand}`,
        `Category: ${product.category}`,
        `Price: ${formatCurrency(product.price)}`,
        `List price: ${formatCurrency(product.listPrice)}`,
        `Stock: ${stockText}`,
        `Rating: ${product.avgRating}/5 from ${product.numReviews} reviews`,
        `Slug: /product/${product.slug}`,
        `Description: ${product.description || 'No description provided.'}`,
        `Tags: ${product.tags.join(', ') || 'None'}`,
      ].join('\n')
    })
    .join('\n\n')
}

function buildSystemPrompt(products: AssistantProductMatch[]) {
  return `You are AZC Electronics' shopping assistant.
Only recommend products that appear in the provided catalog context.
Do not invent products, prices, stock, policies, or technical specifications.
If the catalog context is weak or empty, say that you could not find an exact catalog match and ask one short follow-up question.
Keep answers concise, practical, and sales-assistive.
When recommending products, mention product name, price, stock status, and why it fits.
Catalog context:
${buildCatalogContext(products)}`
}

function buildFallbackReply(message: string, products: AssistantProductMatch[]) {
  if (products.length === 0) {
    return `I could not find an exact product match for "${message}". Please share the brand, category, or key specs you want, and I will narrow it down.`
  }

  const intro =
    products.length === 1
      ? 'I found one strong catalog match:'
      : 'I found these relevant catalog matches:'

  const lines = products.map((product) => {
    const stockText = product.countInStock > 0 ? 'In stock' : 'Out of stock'
    return `- ${product.name} by ${product.brand} for ${formatCurrency(product.price)} (${stockText})`
  })

  return `${intro}\n${lines.join('\n')}\nReply with what you care about most, like budget, brand, or screen size, and I can refine the recommendation.`
}

async function callOpenAI(
  apiKey: string,
  model: string,
  history: AssistantChatMessage[],
  products: AssistantProductMatch[]
) {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: buildSystemPrompt(products) },
        ...history,
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenAI request failed with status ${response.status}`)
  }

  const data = await response.json()
  const reply = data?.choices?.[0]?.message?.content
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('OpenAI returned an empty response')
  }

  return reply.trim()
}

async function callOpenRouter(
  apiKey: string,
  model: string,
  history: AssistantChatMessage[],
  products: AssistantProductMatch[]
) {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
      'X-Title': 'AZC Electronics Assistant',
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      messages: [
        { role: 'system', content: buildSystemPrompt(products) },
        ...history,
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`OpenRouter request failed with status ${response.status}`)
  }

  const data = await response.json()
  const reply = data?.choices?.[0]?.message?.content
  if (typeof reply !== 'string' || !reply.trim()) {
    throw new Error('OpenRouter returned an empty response')
  }

  return reply.trim()
}

export async function generateCatalogAssistantReply(params: {
  message: string
  history: AssistantChatMessage[]
  products: AssistantProductMatch[]
}): Promise<ProviderResponse> {
  const { message, history, products } = params
  const normalizedHistory = [...history, { role: 'user' as const, content: message }]

  const openAiKey = process.env.OPENAI_API_KEY
  const openAiModel = process.env.OPENAI_MODEL
  if (openAiKey && openAiModel) {
    try {
      const reply = await callOpenAI(openAiKey, openAiModel, normalizedHistory, products)
      return { reply, provider: 'openai', usedFallback: false }
    } catch {
      return {
        reply: buildFallbackReply(message, products),
        provider: 'fallback',
        usedFallback: true,
      }
    }
  }

  const openRouterKey = process.env.OPENROUTER_API_KEY
  const openRouterModel = process.env.OPENROUTER_MODEL
  if (openRouterKey && openRouterModel) {
    try {
      const reply = await callOpenRouter(
        openRouterKey,
        openRouterModel,
        normalizedHistory,
        products
      )
      return { reply, provider: 'openrouter', usedFallback: false }
    } catch {
      return {
        reply: buildFallbackReply(message, products),
        provider: 'fallback',
        usedFallback: true,
      }
    }
  }

  return {
    reply: buildFallbackReply(message, products),
    provider: 'fallback',
    usedFallback: true,
  }
}
