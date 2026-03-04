import { Metadata } from 'next'
import { getAllCategoriesForAdmin } from '@/lib/actions/product.actions'
import CategoryList from './category-list'

export const metadata: Metadata = {
  title: 'Manage Categories',
}

export default async function CategoriesPage() {
  const categories = await getAllCategoriesForAdmin()

  return (
    <div className='space-y-4 max-w-2xl'>
      <h1 className='font-bold text-2xl'>Manage Categories</h1>
      <p className='text-muted-foreground text-sm'>
        Click the pencil icon to rename a category. This updates all products in
        that category.
      </p>
      <CategoryList categories={categories} />
    </div>
  )
}
