import { notFound } from 'next/navigation'

import { getOrderById } from '@/lib/actions/order.actions'
import { getSetting } from '@/lib/actions/setting.actions'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-guard'
import { ChevronRight } from 'lucide-react'

export const metadata = {
  title: 'Admin Order Details',
}

const AdminOrderDetailsPage = async (props: {
  params: Promise<{
    id: string
  }>
}) => {
  await requireAdmin()
  const params = await props.params

  const { id } = params

  const [order, { site }] = await Promise.all([
    getOrderById(id),
    getSetting(),
  ])
  if (!order) notFound()

  return (
    <main className='max-w-6xl mx-auto p-4 space-y-4'>
      <nav className='flex items-center gap-1 text-sm text-muted-foreground'>
        <Link
          href='/admin/orders'
          className='hover:text-foreground transition-colors'
        >
          Orders
        </Link>
        <ChevronRight className='h-4 w-4 shrink-0' />
        <span className='text-foreground font-medium truncate max-w-50'>
          {order._id.toString()}
        </span>
      </nav>
      <OrderDetailsForm
        order={order}
        isAdmin
        site={{
          name: site.name,
          address: site.address,
          email: site.email,
          phone: site.phone,
          url: site.url,
        }}
      />
    </main>
  )
}

export default AdminOrderDetailsPage
