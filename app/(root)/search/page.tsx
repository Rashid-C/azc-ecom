import Link from 'next/link'
import ProductCard from '@/components/shared/product/product-card'
import {
  getAllCategories,
  getProductsBySearch,
} from '@/lib/actions/product.actions'

export default async function SearchPage(props: {
  searchParams: Promise<{ q?: string; category?: string; tag?: string }>
}) {
  const searchParams = await props.searchParams
  const q = searchParams.q || 'all'
  const category = searchParams.category || 'all'
  const tag = searchParams.tag || 'all'

  const [products, categories] = await Promise.all([
    getProductsBySearch({ q, category, tag }),
    getAllCategories(),
  ])

  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-2xl font-bold'>Search Products</h1>
        <p className='text-sm text-muted-foreground'>
          {products.length} result{products.length === 1 ? '' : 's'}
        </p>
      </div>

      <div className='flex flex-wrap gap-2'>
        <Link
          href='/search'
          className='px-3 py-1 border rounded-md text-sm hover:bg-muted'
        >
          All
        </Link>
        {categories.map((item) => (
          <Link
            key={item}
            href={`/search?category=${encodeURIComponent(item)}`}
            className='px-3 py-1 border rounded-md text-sm hover:bg-muted'
          >
            {item}
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <p className='text-sm'>No products found for the selected filters.</p>
      ) : (
        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'>
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      )}
    </div>
  )
}
