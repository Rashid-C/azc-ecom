import { Metadata } from 'next'
import ProductList from './product-list'
import { requireAdmin } from '@/lib/auth-guard'

export const metadata: Metadata = {
  title: 'Admin Products',
}

export default async function AdminProduct() {
  await requireAdmin()
  return <ProductList />
}
