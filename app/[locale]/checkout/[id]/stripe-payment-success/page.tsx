import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { confirmStripeOrderPayment } from '@/lib/actions/order.actions'
import { CheckCircle2, XCircle } from 'lucide-react'

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

  return (
    <div className='max-w-4xl w-full mx-auto space-y-8'>
      <div className='flex flex-col gap-6 items-center'>
        <CheckCircle2 className='h-16 w-16 text-emerald-500' />
        <h1 className='font-bold text-2xl lg:text-3xl'>
          Thanks for your purchase!
        </h1>
        <p className='text-muted-foreground'>We are now processing your order.</p>
        <Button
          asChild
          className='rounded-full bg-emerald-600 hover:bg-emerald-700 text-white'
        >
          <Link href={`/account/orders/${id}`}>View Order</Link>
        </Button>
      </div>
    </div>
  )
}
