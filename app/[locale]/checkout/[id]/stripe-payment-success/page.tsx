import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { confirmStripeOrderPayment } from '@/lib/actions/order.actions'

export default async function SuccessPage(props: {
  params: Promise<{
    id: string
  }>
  searchParams: Promise<{ payment_intent: string }>
}) {
  const params = await props.params
  const { id } = params
  const searchParams = await props.searchParams

  if (!searchParams.payment_intent) return redirect(`/checkout/${id}`)

  const res = await confirmStripeOrderPayment(id, searchParams.payment_intent)
  if (!res.success) return notFound()

  return (
    <div className='max-w-4xl w-full mx-auto space-y-8'>
      <div className='flex flex-col gap-6 items-center '>
        <h1 className='font-bold text-2xl lg:text-3xl'>
          Thanks for your purchase
        </h1>
        <div>We are now processing your order.</div>
        <Button
          asChild
          className='rounded-full bg-emerald-600 hover:bg-emerald-700 text-white'
        >
          <Link href={`/account/orders/${id}`}>View order</Link>
        </Button>
      </div>
    </div>
  )
}

