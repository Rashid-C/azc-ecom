import {
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { FormEvent, useState } from 'react'

import { Button } from '@/components/ui/button'
import ProductPrice from '@/components/shared/product/product-price'

export default function StripeForm({
  priceInCents,
  orderId,
}: {
  priceInCents: number
  orderId: string
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string>()

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()

    if (stripe == null || elements == null) return

    setIsLoading(true)
    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/${orderId}/stripe-payment-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === 'card_error' || error.type === 'validation_error') {
          setErrorMessage(error.message)
        } else {
          setErrorMessage('An unknown error occurred')
        }
      })
      .finally(() => setIsLoading(false))
  }

  return (
    <form onSubmit={handleSubmit} className='space-y-4'>
      <div className='text-xl'>Stripe Checkout</div>
      {errorMessage && <div className='text-destructive'>{errorMessage}</div>}
      <PaymentElement />
      <div>
        <LinkAuthenticationElement />
      </div>
      <Button
        className='w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white'
        size='lg'
        disabled={stripe == null || elements == null || isLoading}
      >
        {isLoading ? (
          'Purchasing...'
        ) : (
          <div>
            Purchase - <ProductPrice price={priceInCents / 100} plain />
          </div>
        )}
      </Button>
    </form>
  )
}
