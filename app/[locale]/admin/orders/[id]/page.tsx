import { notFound } from 'next/navigation'

import { getOrderById } from '@/lib/actions/order.actions'
import OrderDetailsForm from '@/components/shared/order/order-details-form'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth-guard'

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

  const order = await getOrderById(id)
  if (!order) notFound()

  return (
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/orders'>Orders</Link> <span className='mx-1'>›</span>
        <Link href={`/admin/orders/${order._id}`}>{order._id.toString()}</Link>
      </div>
      <OrderDetailsForm
        order={order}
        isAdmin
      />
    </main>
  )
}

export default AdminOrderDetailsPage
