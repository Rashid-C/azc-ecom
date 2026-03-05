import Image from 'next/image'
import Link from 'next/link'

import Pagination from '@/components/shared/pagination'
import ProductCard from '@/components/shared/product/product-card'
import { Button } from '@/components/ui/button'
import {
  getCategoriesWithImages,
  getAllProducts,
  getAllTags,
} from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import ProductSortSelector from '@/components/shared/product/product-sort-selector'
import { getFilterUrl, toSlug } from '@/lib/utils'
import Rating from '@/components/shared/product/rating'

import CollapsibleOnMobile from '@/components/shared/collapsible-on-mobile'
import { getTranslations } from 'next-intl/server'
import { SlidersHorizontal, Tag, Star, DollarSign, Layers } from 'lucide-react'

const sortOrders = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg. customer review' },
  { value: 'best-selling', name: 'Best selling' },
]

const prices = [
  {
    name: 'AED 1 to AED 20',
    value: '1-20',
  },
  {
    name: 'AED 21 to AED 50',
    value: '21-50',
  },
  {
    name: 'AED 51 to AED 1000',
    value: '51-1000',
  },
]

export async function generateMetadata(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams
  const t = await getTranslations()
  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
  } = searchParams

  if (
    (q !== 'all' && q !== '') ||
    category !== 'all' ||
    tag !== 'all' ||
    rating !== 'all' ||
    price !== 'all'
  ) {
    return {
      title: `${t('Search.Search')} ${q !== 'all' ? q : ''}
          ${category !== 'all' ? ` : ${t('Search.Category')} ${category}` : ''}
          ${tag !== 'all' ? ` : ${t('Search.Tag')} ${tag}` : ''}
          ${price !== 'all' ? ` : ${t('Search.Price')} ${price}` : ''}
          ${rating !== 'all' ? ` : ${t('Search.Rating')} ${rating}` : ''}`,
    }
  } else {
    return {
      title: t('Search.Search Products'),
    }
  }
}

export default async function SearchPage(props: {
  searchParams: Promise<{
    q: string
    category: string
    tag: string
    price: string
    rating: string
    sort: string
    page: string
  }>
}) {
  const searchParams = await props.searchParams

  const {
    q = 'all',
    category = 'all',
    tag = 'all',
    price = 'all',
    rating = 'all',
    sort = 'best-selling',
    page = '1',
  } = searchParams

  const params = { q, category, tag, price, rating, sort, page }

  const categories = await getCategoriesWithImages()
  const tags = await getAllTags()
  const data = await getAllProducts({
    category,
    tag,
    query: q,
    price,
    rating,
    page: Number(page),
    sort,
  })
  const t = await getTranslations()
  const hasFilters =
    (q !== 'all' && q !== '') ||
    (category !== 'all' && category !== '') ||
    (tag !== 'all' && tag !== '') ||
    rating !== 'all' ||
    price !== 'all'

  return (
    <div className='space-y-3'>
      {/* Result bar */}
      <div className='flex flex-wrap items-center justify-between gap-2 rounded-xl bg-card border px-4 py-2.5'>
        <div className='flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground min-w-0'>
          <span className='font-medium text-foreground'>
            {data.totalProducts === 0
              ? t('Search.No')
              : `${data.from}–${data.to} ${t('Search.of')} ${data.totalProducts}`}
            {' '}{t('Search.results')}
          </span>
          {hasFilters && <span>{t('Search.for')}</span>}
          {q !== 'all' && q !== '' && (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium'>
              &ldquo;{q}&rdquo;
            </span>
          )}
          {category !== 'all' && category !== '' && (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium'>
              {t('Search.Category')}: {category}
            </span>
          )}
          {tag !== 'all' && tag !== '' && (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium'>
              {t('Search.Tag')}: {tag}
            </span>
          )}
          {price !== 'all' && (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium'>
              {t('Search.Price')}: {price}
            </span>
          )}
          {rating !== 'all' && (
            <span className='inline-flex items-center px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium'>
              {t('Search.Rating')}: {rating}★+
            </span>
          )}
          {hasFilters && (
            <Button variant='ghost' size='sm' className='h-6 px-2 text-xs' asChild>
              <Link href='/search'>{t('Search.Clear')}</Link>
            </Button>
          )}
        </div>
        <ProductSortSelector sortOrders={sortOrders} sort={sort} params={params} />
      </div>
      {/* ── Category circle strip ── */}
      <div className='flex items-center gap-2 rounded-2xl px-4 md:px-6 py-3 overflow-x-auto scrollbar-hide backdrop-blur-md bg-white/60 dark:bg-gray-900/40 border border-white/70 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]'>

        {/* All */}
        <Link
          href={getFilterUrl({ category: 'all', params })}
          className='flex flex-col gap-1 md:gap-1.5 group shrink-0 w-12 md:w-16'
        >
          <div className='relative pb-1 mx-auto'>
            <div
              className={`w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105
                ${
                  category === 'all' || category === ''
                    ? 'bg-gray-900 dark:bg-white scale-[1.08] shadow-[0_6px_20px_rgba(0,0,0,0.35)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.2)]'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                }`}
            >
              <svg
                className={`w-4 h-4 md:w-6 md:h-6 transition-all duration-300 ${category === 'all' || category === '' ? 'text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}
                fill='none' viewBox='0 0 24 24' stroke='currentColor' strokeWidth={1.5}
              >
                <path strokeLinecap='round' strokeLinejoin='round' d='M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z' />
              </svg>
            </div>
            {(category === 'all' || category === '') && (
              <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white animate-pulse' />
            )}
          </div>
          <span
            className={`text-[9px] md:text-[10px] text-center leading-tight font-semibold tracking-wide transition-all duration-300
              ${category === 'all' || category === '' ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-200 group-hover:scale-105'}`}
          >
            {t('Search.All')}
          </span>
        </Link>

        {/* Divider */}
        <div className='h-10 w-px shrink-0 bg-linear-to-b from-transparent via-gray-300/60 dark:via-white/15 to-transparent' />

        {/* Each category */}
        {categories.map((c) => {
          const isActive = c.name === category
          return (
            <Link
              key={c.name}
              href={getFilterUrl({ category: c.name, params })}
              className='flex flex-col gap-1 md:gap-1.5 group shrink-0 w-14 md:w-24'
            >
              <div className='relative pb-1 mx-auto'>
                {isActive && (
                  <span className='absolute inset-0 rounded-full animate-pulse bg-gray-900/10 dark:bg-white/10 scale-[1.18]' />
                )}
                <div
                  className={`w-10 h-10 md:w-14 md:h-14 rounded-full transition-all duration-500 ease-out group-hover:-translate-y-1 group-hover:scale-105
                    ${
                      isActive
                        ? 'ring-2 ring-gray-900/80 dark:ring-white/80 ring-offset-2 ring-offset-transparent scale-[1.08] shadow-[0_6px_20px_rgba(0,0,0,0.25)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.12)]'
                        : 'ring-1 ring-black/8 dark:ring-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:ring-gray-400/50 dark:group-hover:ring-white/25 group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.45)]'
                    }`}
                >
                  <div className='w-full h-full rounded-full overflow-hidden'>
                    <Image
                      src={c.image}
                      alt={c.name}
                      width={56}
                      height={56}
                      className='w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.12]'
                    />
                  </div>
                </div>
                {isActive && (
                  <span className='absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-gray-900 dark:bg-white animate-pulse' />
                )}
              </div>
              <span
                className={`text-[9px] md:text-[10px] text-center leading-snug font-semibold tracking-wide transition-all duration-300 w-full whitespace-normal wrap-break-word
                  ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-200 group-hover:scale-105'}`}
              >
                {c.name}
              </span>
            </Link>
          )
        })}
      </div>

      <div className='grid md:grid-cols-5 md:gap-5'>
        {/* Filter sidebar */}
        <CollapsibleOnMobile title={t('Search.Filters')}>
          <div className='rounded-xl border bg-card p-4 space-y-5'>
            {/* Department */}
            <div>
              <div className='flex items-center gap-1.5 mb-2.5'>
                <Layers className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('Search.Department')}</span>
              </div>
              <div className='flex flex-col gap-1'>
                <Link
                  href={getFilterUrl({ category: 'all', params })}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    'all' === category || '' === category
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {t('Search.All')}
                </Link>
                {categories.map((c) => (
                  <Link
                    key={c.name}
                    href={getFilterUrl({ category: c.name, params })}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      c.name === category
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {c.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className='h-px bg-border' />

            {/* Price */}
            <div>
              <div className='flex items-center gap-1.5 mb-2.5'>
                <DollarSign className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('Search.Price')}</span>
              </div>
              <div className='flex flex-col gap-1'>
                <Link
                  href={getFilterUrl({ price: 'all', params })}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    'all' === price
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {t('Search.All')}
                </Link>
                {prices.map((p) => (
                  <Link
                    key={p.value}
                    href={getFilterUrl({ price: p.value, params })}
                    className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                      p.value === price
                        ? 'bg-primary text-primary-foreground font-medium'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                    }`}
                  >
                    {p.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className='h-px bg-border' />

            {/* Rating */}
            <div>
              <div className='flex items-center gap-1.5 mb-2.5'>
                <Star className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('Search.Customer Review')}</span>
              </div>
              <div className='flex flex-col gap-1'>
                <Link
                  href={getFilterUrl({ rating: 'all', params })}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    'all' === rating
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {t('Search.All')}
                </Link>
                <Link
                  href={getFilterUrl({ rating: '4', params })}
                  className={`text-sm px-3 py-1.5 rounded-lg transition-colors ${
                    '4' === rating
                      ? 'bg-primary text-primary-foreground font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <div className='flex items-center gap-1'>
                    <Rating size={4} rating={4} />
                    <span>{t('Search.& Up')}</span>
                  </div>
                </Link>
              </div>
            </div>

            <div className='h-px bg-border' />

            {/* Tags */}
            <div>
              <div className='flex items-center gap-1.5 mb-2.5'>
                <Tag className='h-3.5 w-3.5 text-muted-foreground' />
                <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('Search.Tag')}</span>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                <Link
                  href={getFilterUrl({ tag: 'all', params })}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    'all' === tag || '' === tag
                      ? 'bg-primary text-primary-foreground border-primary font-medium'
                      : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                  }`}
                >
                  {t('Search.All')}
                </Link>
                {tags.map((t: string) => (
                  <Link
                    key={t}
                    href={getFilterUrl({ tag: t, params })}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      toSlug(t) === tag
                        ? 'bg-primary text-primary-foreground border-primary font-medium'
                        : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                    }`}
                  >
                    {t}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </CollapsibleOnMobile>

        {/* Product grid */}
        <div className='md:col-span-4 space-y-4'>
          <div className='flex items-center justify-between'>
            <div>
              <h1 className='font-bold text-lg'>{t('Search.Results')}</h1>
              <p className='text-sm text-muted-foreground'>{t('Search.Check each product page for other buying options')}</p>
            </div>
          </div>

          {data.products.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-16 text-center rounded-xl border bg-card'>
              <SlidersHorizontal className='h-12 w-12 text-muted-foreground/40 mb-3' />
              <p className='font-medium text-muted-foreground'>{t('Search.No product found')}</p>
              <Button variant='link' asChild className='mt-2'>
                <Link href='/search'>{t('Search.Clear')}</Link>
              </Button>
            </div>
          ) : (
            <div className='grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
              {data.products.map((product: IProduct) => (
                <ProductCard key={product._id.toString()} product={product} />
              ))}
            </div>
          )}
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}
