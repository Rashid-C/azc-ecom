import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

import { connectToDatabase } from '@/lib/db'
import {
  findRelevantProducts,
  generateCatalogAssistantReply,
} from '@/lib/ai/catalog-assistant'
import { formatError } from '@/lib/utils'

export const runtime = 'nodejs'

const chatRequestSchema = z.object({
  message: z.string().trim().min(1).max(1000),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(2000),
      })
    )
    .max(12)
    .optional()
    .default([]),
})

export async function POST(request: NextRequest) {
  try {
    const body = chatRequestSchema.parse(await request.json())

    await connectToDatabase()

    const products = await findRelevantProducts(body.message)
    const result = await generateCatalogAssistantReply({
      message: body.message,
      history: body.history,
      products,
    })

    return NextResponse.json({
      reply: result.reply,
      provider: result.provider,
      usedFallback: result.usedFallback,
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        price: product.price,
        listPrice: product.listPrice,
        countInStock: product.countInStock,
        avgRating: product.avgRating,
        numReviews: product.numReviews,
      })),
    })
  } catch (error) {
    return NextResponse.json(
      { message: formatError(error) },
      { status: error instanceof z.ZodError ? 400 : 500 }
    )
  }
}
