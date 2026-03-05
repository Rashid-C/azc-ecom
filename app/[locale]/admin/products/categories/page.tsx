import { Metadata } from 'next'
import { getCategoriesWithCounts } from '@/lib/actions/product.actions'
import CategoryList from './category-list'
import { requireAdmin } from '@/lib/auth-guard'

export const metadata: Metadata = {
  title: 'Manage Categories',
}

export default async function CategoriesPage() {
  await requireAdmin()
  const categories = await getCategoriesWithCounts()

  const totalProducts = categories.reduce((s, c) => s + c.count, 0)
  const totalPublished = categories.reduce((s, c) => s + c.published, 0)
  const publishRate =
    totalProducts > 0 ? Math.round((totalPublished / totalProducts) * 100) : 0

  return (
    <div className='space-y-6'>
      {/* Hero header */}
      <div className='relative overflow-hidden rounded-2xl bg-linear-to-br from-primary via-primary/90 to-primary/70 shadow-lg'>
        {/* Decorative blobs */}
        <div className='pointer-events-none absolute -top-10 -right-10 w-52 h-52 rounded-full bg-white/10' />
        <div className='pointer-events-none absolute -bottom-14 -right-20 w-72 h-72 rounded-full bg-white/5' />
        <div className='pointer-events-none absolute top-4 left-1/2 w-32 h-32 rounded-full bg-white/5' />

        <div className='relative px-6 py-7 sm:px-8'>
          <p className='text-xs font-semibold uppercase tracking-widest text-primary-foreground/60 mb-1'>
            Admin · Products
          </p>
          <h1 className='text-2xl sm:text-3xl font-bold text-primary-foreground'>
            Category Manager
          </h1>
          <p className='text-sm text-primary-foreground/70 mt-1 max-w-lg'>
            Rename any category below — changes apply instantly to all linked products.
          </p>

          {/* Stats */}
          <div className='mt-6 grid grid-cols-3 sm:flex sm:flex-wrap gap-3 sm:gap-6'>
            <div className='flex flex-col gap-0.5 bg-white/10 rounded-xl px-4 py-3 sm:bg-transparent sm:p-0'>
              <span className='text-2xl sm:text-3xl font-bold text-primary-foreground leading-none'>
                {categories.length}
              </span>
              <span className='text-xs text-primary-foreground/60'>Categories</span>
            </div>
            <div className='hidden sm:block w-px bg-white/20 self-stretch' />
            <div className='flex flex-col gap-0.5 bg-white/10 rounded-xl px-4 py-3 sm:bg-transparent sm:p-0'>
              <span className='text-2xl sm:text-3xl font-bold text-primary-foreground leading-none'>
                {totalProducts}
              </span>
              <span className='text-xs text-primary-foreground/60'>Total Products</span>
            </div>
            <div className='hidden sm:block w-px bg-white/20 self-stretch' />
            <div className='flex flex-col gap-0.5 bg-white/10 rounded-xl px-4 py-3 sm:bg-transparent sm:p-0'>
              <span className='text-2xl sm:text-3xl font-bold text-primary-foreground leading-none'>
                {publishRate}%
              </span>
              <span className='text-xs text-primary-foreground/60'>Published Rate</span>
            </div>
          </div>
        </div>
      </div>

      <CategoryList categories={categories} />
    </div>
  )
}
