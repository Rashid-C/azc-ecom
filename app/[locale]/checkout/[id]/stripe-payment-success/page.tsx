import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { confirmStripeOrderPayment } from '@/lib/actions/order.actions'
import { XCircle } from 'lucide-react'

export default async function SuccessPage(props: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ payment_intent: string }>
}) {
  const { id } = await props.params
  const { payment_intent } = await props.searchParams

  if (!payment_intent) return redirect(`/checkout/${id}`)

  const res = await confirmStripeOrderPayment(id, payment_intent)

  if (!res.success) {
    return (
      <div className='max-w-lg w-full mx-auto space-y-6 text-center py-12'>
        <XCircle className='h-14 w-14 text-destructive mx-auto' />
        <h1 className='font-bold text-2xl'>Payment Confirmation Failed</h1>
        <p className='text-muted-foreground text-sm'>{res.message}</p>
        <div className='flex flex-col sm:flex-row gap-3 justify-center'>
          <Button asChild variant='outline'>
            <Link href={`/account/orders/${id}`}>View Order</Link>
          </Button>
          <Button asChild>
            <Link href='/'>Go Home</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Redirect straight to the order page — it reads fresh data from DB
  redirect(`/account/orders/${id}`)
}
