import data from '@/lib/data'
import { IProductInput, ISettingInput, IWebPageInput } from '@/types'

const mongoConnectionErrorCodes = new Set([
  'ECONNREFUSED',
  'ENOTFOUND',
  'ETIMEOUT',
  'ESERVFAIL',
  'ECONNRESET',
])

export function shouldUseDevDbFallback(error: unknown) {
  if (process.env.NODE_ENV !== 'development') return false

  const candidate = error as {
    code?: string
    message?: string
    cause?: { code?: string; message?: string }
  }

  const code = candidate?.code || candidate?.cause?.code
  const message = candidate?.message || candidate?.cause?.message || ''

  return (
    (typeof code === 'string' && mongoConnectionErrorCodes.has(code)) ||
    message.includes('querySrv') ||
    message.includes('MongooseServerSelectionError') ||
    message.includes('Server selection timed out')
  )
}

export function logDevDbFallback(scope: string, error: unknown) {
  const candidate = error as { message?: string }
  console.warn(
    `[dev-db-fallback] ${scope}: ${
      candidate?.message || 'Database unavailable, using seed data'
    }`
  )
}

export function getFallbackSetting(): ISettingInput {
  return structuredClone(data.settings[0])
}

export function getPublishedFallbackProducts(): IProductInput[] {
  return structuredClone(data.products.filter((product) => product.isPublished))
}

export function getFallbackWebPages(): IWebPageInput[] {
  return structuredClone(data.webPages)
}

const toObjectIdLike = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-f0-9]/g, '')
    .padEnd(24, '0')
    .slice(0, 24)

export function withFallbackProductIds(products: IProductInput[]) {
  return products.map((product) => ({
    ...product,
    _id: toObjectIdLike(product.slug),
  }))
}
