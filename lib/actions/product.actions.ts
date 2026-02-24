'use server'

import { connectToDatabase } from '@/lib/db'
import Product, { IProduct } from '../db/models/product.model'
import { PAGE_SIZE } from '../constants'
// import Product , { IProduct } from '@/lib/db/models/product.model'

export async function getAllCategories() {
    await connectToDatabase()
    const categories = await Product.find({ isPublished: true }).distinct(
        'category'
    )
    return categories
}

export async function getProductsForCard({
    tag,
    limit = 4,
}: {
    tag: string
    limit?: number
}) {
    await connectToDatabase()
    const products = await Product.find(
        { tags: { $in: [tag] }, isPublished: true },
        {
            name: 1,
            href: { $concat: ['/product/', '$slug'] },
            image: { $arrayElemAt: ['$images', 0] },
        }
    )
        .sort({ createdAt: 'desc' })
        .limit(limit)
    return JSON.parse(JSON.stringify(products)) as {
        name: string
        href: string
        image: string
    }[]
}


//GET PRODUCTS BY TAG
export async function getProductsByTag({
  tag,
  limit = 10,
}: {
  tag: string
  limit?: number
}) {
  await connectToDatabase()
  const products = await Product.find({
    tags: { $in: [tag] },
    isPublished: true,
  })
    .sort({ createdAt: 'desc' })
    .limit(limit)
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}


// GET ONE PRODUCT BY SLUG
export async function getProductBySlug(slug: string) {
  await connectToDatabase()
  const product = await Product.findOne({ slug, isPublished: true })
  if (!product) throw new Error('Product not found')
  return JSON.parse(JSON.stringify(product)) as IProduct
}
// GET RELATED PRODUCTS: PRODUCTS WITH SAME CATEGORY
export async function getRelatedProductsByCategory({
  category,
  productId,
  limit = PAGE_SIZE,
  page = 1,
}: {
  category: string
  productId: string
  limit?: number
  page: number
}) {
  await connectToDatabase()
  const skipAmount = (Number(page) - 1) * limit
  const conditions = {
    isPublished: true,
    category,
    _id: { $ne: productId },
  }
  const products = await Product.find(conditions)
    .sort({ numSales: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const productsCount = await Product.countDocuments(conditions)
  return {
    data: JSON.parse(JSON.stringify(products)) as IProduct[],
    totalPages: Math.ceil(productsCount / limit),
  }
}

// GET PRODUCTS BY SEARCH/FILTERS
export async function getProductsBySearch({
  q = 'all',
  category = 'all',
  tag = 'all',
}: {
  q?: string
  category?: string
  tag?: string
}) {
  await connectToDatabase()
  const conditions: Record<string, unknown> = { isPublished: true }

  if (q !== 'all') {
    conditions.name = { $regex: q, $options: 'i' }
  }
  if (category !== 'all') {
    conditions.category = category
  }
  if (tag !== 'all') {
    conditions.tags = { $in: [tag] }
  }

  const products = await Product.find(conditions).sort({ createdAt: 'desc' })
  return JSON.parse(JSON.stringify(products)) as IProduct[]
}
