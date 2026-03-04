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

const sortOrders = [
  { value: 'price-low-to-high', name: 'Price: Low to high' },
  { value: 'price-high-to-low', name: 'Price: High to low' },
  { value: 'newest-arrivals', name: 'Newest arrivals' },
  { value: 'avg-customer-review', name: 'Avg. customer review' },
  { value: 'best-selling', name: 'Best selling' },
]

const prices = [
  {
    name: '$1 to $20',
    value: '1-20',
  },
  {
    name: '$21 to $50',
    value: '21-50',
  },
  {
    name: '$51 to $1000',
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
  return (
    <div>
      <div className='my-2 bg-card md:border-b  flex-between flex-col md:flex-row '>
        <div className='flex items-center'>
          {data.totalProducts === 0
            ? t('Search.No')
            : `${data.from}-${data.to} ${t('Search.of')} ${
                data.totalProducts
              }`}{' '}
          {t('Search.results')}
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          rating !== 'all' ||
          price !== 'all'
            ? ` ${t('Search.for')} `
            : null}
          {q !== 'all' && q !== '' && '"' + q + '"'}
          {category !== 'all' &&
            category !== '' &&
            `   ${t('Search.Category')}: ` + category}
          {tag !== 'all' && tag !== '' && `   ${t('Search.Tag')}: ` + tag}
          {price !== 'all' && `    ${t('Search.Price')}: ` + price}
          {rating !== 'all' &&
            `    ${t('Search.Rating')}: ` + rating + ` & ${t('Search.up')}`}
          &nbsp;
          {(q !== 'all' && q !== '') ||
          (category !== 'all' && category !== '') ||
          (tag !== 'all' && tag !== '') ||
          rating !== 'all' ||
          price !== 'all' ? (
            <Button variant={'link'} asChild>
              <Link href='/search'>{t('Search.Clear')}</Link>
            </Button>
          ) : null}
        </div>
        <div>
          <ProductSortSelector
            sortOrders={sortOrders}
            sort={sort}
            params={params}
          />
        </div>
      </div>
      {/* ── Category circle strip — desktop only ── */}
      <div className='hidden md:flex items-center gap-4 my-3 rounded-2xl px-6 py-3 overflow-x-auto scrollbar-hide backdrop-blur-md bg-white/60 dark:bg-gray-900/40 border border-white/70 dark:border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.07)] dark:shadow-[0_4px_24px_rgba(0,0,0,0.3)]'>

        {/* All */}
        <Link
          href={getFilterUrl({ category: 'all', params })}
          className='flex flex-col items-center gap-1.5 group shrink-0 w-16'
        >
          <div className='relative pb-1'>
            <div
              className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105
                ${
                  category === 'all' || category === ''
                    ? 'bg-gray-900 dark:bg-white scale-[1.08] shadow-[0_6px_20px_rgba(0,0,0,0.35)] dark:shadow-[0_6px_20px_rgba(255,255,255,0.2)]'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-white/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.08)] group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.15)] dark:group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)]'
                }`}
            >
              <svg
                className={`w-6 h-6 transition-all duration-300 ${category === 'all' || category === '' ? 'text-white dark:text-gray-900' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-200'}`}
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
            className={`text-[10px] text-center leading-tight font-semibold tracking-wide transition-all duration-300
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
              className='flex flex-col items-center gap-1.5 group shrink-0 w-16'
            >
              <div className='relative pb-1'>
                {/* glow ring for active */}
                {isActive && (
                  <span className='absolute inset-0 rounded-full animate-pulse bg-gray-900/10 dark:bg-white/10 scale-[1.18]' />
                )}
                <div
                  className={`w-14 h-14 rounded-full transition-all duration-500 ease-out group-hover:-translate-y-1.5 group-hover:scale-105
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
                className={`text-[10px] text-center leading-tight font-semibold tracking-wide transition-all duration-300 line-clamp-1
                  ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-800 dark:group-hover:text-gray-200 group-hover:scale-105'}`}
              >
                {c.name}
              </span>
            </Link>
          )
        })}
      </div>

      <div className='bg-card grid md:grid-cols-5 md:gap-4'>
        <CollapsibleOnMobile title={t('Search.Filters')}>
          <div className='space-y-4'>
            <div>
              <div className='font-bold'>{t('Search.Department')}</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      ('all' === category || '' === category) && 'text-primary'
                    }`}
                    href={getFilterUrl({ category: 'all', params })}
                  >
                    {t('Search.All')}
                  </Link>
                </li>
                {categories.map((c) => (
                  <li key={c.name}>
                    <Link
                      className={`${c.name === category && 'text-primary'}`}
                      href={getFilterUrl({ category: c.name, params })}
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className='font-bold'>{t('Search.Price')}</div>
              <ul>
                <li>
                  <Link
                    className={`${'all' === price && 'text-primary'}`}
                    href={getFilterUrl({ price: 'all', params })}
                  >
                    {t('Search.All')}
                  </Link>
                </li>
                {prices.map((p) => (
                  <li key={p.value}>
                    <Link
                      href={getFilterUrl({ price: p.value, params })}
                      className={`${p.value === price && 'text-primary'}`}
                    >
                      {p.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className='font-bold'>{t('Search.Customer Review')}</div>
              <ul>
                <li>
                  <Link
                    href={getFilterUrl({ rating: 'all', params })}
                    className={`${'all' === rating && 'text-primary'}`}
                  >
                    {t('Search.All')}
                  </Link>
                </li>

                <li>
                  <Link
                    href={getFilterUrl({ rating: '4', params })}
                    className={`${'4' === rating && 'text-primary'}`}
                  >
                    <div className='flex'>
                      <Rating size={4} rating={4} /> {t('Search.& Up')}
                    </div>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <div className='font-bold'>{t('Search.Tag')}</div>
              <ul>
                <li>
                  <Link
                    className={`${
                      ('all' === tag || '' === tag) && 'text-primary'
                    }`}
                    href={getFilterUrl({ tag: 'all', params })}
                  >
                    {t('Search.All')}
                  </Link>
                </li>
                {tags.map((t: string) => (
                  <li key={t}>
                    <Link
                      className={`${toSlug(t) === tag && 'text-primary'}`}
                      href={getFilterUrl({ tag: t, params })}
                    >
                      {t}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CollapsibleOnMobile>

        <div className='md:col-span-4 space-y-4'>
          <div>
            <div className='font-bold text-xl'>{t('Search.Results')}</div>
            <div>
              {t('Search.Check each product page for other buying options')}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2  lg:grid-cols-3  '>
            {data.products.length === 0 && (
              <div>{t('Search.No product found')}</div>
            )}
            {data.products.map((product: IProduct) => (
              <ProductCard key={product._id.toString()} product={product} />
            ))}
          </div>
          {data.totalPages > 1 && (
            <Pagination page={page} totalPages={data.totalPages} />
          )}
        </div>
      </div>
    </div>
  )
}