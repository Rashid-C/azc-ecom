'use client'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { cn } from '@/lib/utils'
import { CheckCircle2Icon, Mail, MapPin, Phone, Store, Truck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { notFound, useRouter } from 'next/navigation'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import { useTranslations } from 'next-intl'

export default function CartAddItem({ itemId }: { itemId: string }) {
  const router = useRouter()
  const {
    cart: { items, itemsPrice, fulfillmentMethod },
    setFulfillmentMethod,
  } = useCartStore()
  const {
    setting: { site },
  } = useSettingStore()
  const item = items.find((x) => x.clientId === itemId)

  const t = useTranslations()
  if (!item) return notFound()

  const handleProceedToCheckout = () => {
    if (!fulfillmentMethod) return
    router.push('/checkout')
  }

  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-2 md:gap-4'>
        <Card className='w-full rounded-none'>
          <CardContent className='flex h-full items-center justify-center gap-3 py-4'>
            <Link href={`/product/${item.slug}`}>
              <Image
                src={item.image}
                alt={item.name}
                width={80}
                height={80}
                style={{ maxWidth: '100%', height: 'auto' }}
              />
            </Link>
            <div>
              <h3 className='text-xl font-bold flex gap-2 my-2'>
                <CheckCircle2Icon className='h-6 w-6 text-green-700' />
                {t('Cart.Added to cart')}
              </h3>
              <p className='text-sm'>
                <span className='font-bold'> {t('Cart.Color')}: </span>{' '}
                {item.color ?? '-'}
              </p>
              <p className='text-sm'>
                <span className='font-bold'> {t('Cart.Size')}: </span>{' '}
                {item.size ?? '-'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className='w-full rounded-none'>
          <CardContent className='p-4 h-full'>
            <div className='flex flex-col gap-4'>
              {/* Cart Subtotal */}
              <div className='flex gap-3 items-center'>
                <span className='text-lg font-bold'>Cart Subtotal:</span>
                <ProductPrice className='text-2xl' price={itemsPrice} />
              </div>

              {/* Fulfillment Method Selection */}
              <div className='space-y-2'>
                <p className='font-semibold text-sm'>Choose Fulfillment Method</p>
                <RadioGroup
                  value={fulfillmentMethod ?? ''}
                  onValueChange={(v) =>
                    setFulfillmentMethod(v as 'store-pickup' | 'home-delivery')
                  }
                  className='space-y-2'
                >
                  {/* Store Pickup */}
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${fulfillmentMethod === 'store-pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='store-pickup' id='ci-store-pickup' />
                      <Label
                        htmlFor='ci-store-pickup'
                        className='cursor-pointer flex items-center gap-2 font-semibold'
                      >
                        <Store className='h-4 w-4 text-green-600' />
                        Collect from Store
                        <span className='text-xs font-normal text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full'>
                          FREE
                        </span>
                      </Label>
                    </div>
                    {fulfillmentMethod === 'store-pickup' && (
                      <div className='mt-3 ml-6 space-y-1.5 text-sm text-muted-foreground'>
                        <div className='flex items-start gap-2'>
                          <MapPin className='h-3.5 w-3.5 shrink-0 mt-0.5 text-primary' />
                          <span>{site.address}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Phone className='h-3.5 w-3.5 shrink-0 text-primary' />
                          <span>{site.phone}</span>
                        </div>
                        <div className='flex items-center gap-2'>
                          <Mail className='h-3.5 w-3.5 shrink-0 text-primary' />
                          <span>{site.email}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Home Delivery */}
                  <div
                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${fulfillmentMethod === 'home-delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}
                  >
                    <div className='flex items-center gap-2'>
                      <RadioGroupItem value='home-delivery' id='ci-home-delivery' />
                      <Label
                        htmlFor='ci-home-delivery'
                        className='cursor-pointer flex items-center gap-2 font-semibold'
                      >
                        <Truck className='h-4 w-4 text-blue-600' />
                        Home Delivery
                      </Label>
                    </div>
                    {fulfillmentMethod === 'home-delivery' && (
                      <p className='mt-2 ml-6 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1'>
                        Delivery charge varies by location. An additional fee will
                        be applied based on your address after purchase.
                      </p>
                    )}
                  </div>
                </RadioGroup>
              </div>

              {/* Action Buttons */}
              <div className='flex flex-col gap-2'>
                <Button
                  disabled={!fulfillmentMethod}
                  onClick={handleProceedToCheckout}
                  className='rounded-full w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold disabled:opacity-50'
                >
                  Proceed to checkout ({items.reduce((a, c) => a + c.quantity, 0)}{' '}
                  items)
                </Button>
                {!fulfillmentMethod && (
                  <p className='text-xs text-center text-muted-foreground'>
                    Please select a fulfillment method to continue.
                  </p>
                )}
                <Link
                  href='/cart'
                  className={cn(
                    buttonVariants({ variant: 'outline' }),
                    'rounded-full w-full'
                  )}
                >
                  {t('Cart.Go to Cart')}
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <BrowsingHistoryList />
    </div>
  )
}
