'use client'
import BrowsingHistoryList from '@/components/shared/browsing-history-list'
import ProductPrice from '@/components/shared/product/product-price'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import React from 'react'
import { MapPin, Phone, Mail, Store, Truck } from 'lucide-react'

export default function CartPage() {
  const {
    cart: { items, itemsPrice, fulfillmentMethod },
    updateItem,
    removeItem,
    setFulfillmentMethod,
  } = useCartStore()
  const router = useRouter()
  const {
    setting: {
      site,
      common: { freeShippingMinPrice },
    },
  } = useSettingStore()

  const t = useTranslations()
  return (
    <div>
      <div className='grid grid-cols-1 md:grid-cols-4  md:gap-4'>
        {items.length === 0 ? (
          <Card className='col-span-4 rounded-none'>
            <CardHeader className='text-3xl  '>
              {t('Cart.Your Shopping Cart is empty')}
            </CardHeader>
            <CardContent>
              {t.rich('Cart.Continue shopping on', {
                name: site.name,
                home: (chunks) => <Link href='/'>{chunks}</Link>,
              })}
            </CardContent>
          </Card>
        ) : (
          <>
            <div className='col-span-3'>
              <Card className='rounded-none'>
                <CardHeader className='text-3xl pb-0'>
                  {t('Cart.Shopping Cart')}
                </CardHeader>
                <CardContent className='p-4'>
                  <div className='flex justify-end border-b mb-4'>
                    {t('Cart.Price')}
                  </div>

                  {items.map((item) => (
                    <div
                      key={item.clientId}
                      className='flex flex-col md:flex-row justify-between py-4 border-b gap-4'
                    >
                      <Link href={`/product/${item.slug}`}>
                        <div className='relative w-40 h-40'>
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes='20vw'
                            style={{
                              objectFit: 'contain',
                            }}
                          />
                        </div>
                      </Link>

                      <div className='flex-1 space-y-4'>
                        <Link
                          href={`/product/${item.slug}`}
                          className='text-lg hover:no-underline  '
                        >
                          {item.name}
                        </Link>
                        <div>
                          <p className='text-sm'>
                            <span className='font-bold'>
                              {' '}
                              {t('Cart.Color')}:{' '}
                            </span>{' '}
                            {item.color}
                          </p>
                          <p className='text-sm'>
                            <span className='font-bold'>
                              {' '}
                              {t('Cart.Size')}:{' '}
                            </span>{' '}
                            {item.size}
                          </p>
                        </div>
                        <div className='flex gap-2 items-center'>
                          <Select
                            value={item.quantity.toString()}
                            onValueChange={(value) =>
                              updateItem(item, Number(value))
                            }
                          >
                            <SelectTrigger className='w-auto'>
                              <SelectValue>
                                {t('Cart.Quantity')}: {item.quantity}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent position='popper'>
                              {Array.from({
                                length: item.countInStock,
                              }).map((_, i) => (
                                <SelectItem key={i + 1} value={`${i + 1}`}>
                                  {i + 1}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            variant={'outline'}
                            onClick={() => removeItem(item)}
                          >
                            {t('Cart.Delete')}
                          </Button>
                        </div>
                      </div>
                      <div>
                        <p className='text-right'>
                          {item.quantity > 1 && (
                            <>
                              {item.quantity} x
                              <ProductPrice price={item.price} plain />
                              <br />
                            </>
                          )}

                          <span className='font-bold text-lg'>
                            <ProductPrice
                              price={item.price * item.quantity}
                              plain
                            />
                          </span>
                        </p>
                      </div>
                    </div>
                  ))}

                  <div className='flex justify-end text-lg my-2'>
                    {t('Cart.Subtotal')} (
                    {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                    {t('Cart.Items')}):{' '}
                    <span className='font-bold ml-1'>
                      <ProductPrice price={itemsPrice} plain />
                    </span>{' '}
                  </div>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card className='rounded-none'>
                <CardContent className='py-4 space-y-4'>
                  <div className='text-lg'>
                    {t('Cart.Subtotal')} (
                    {items.reduce((acc, item) => acc + item.quantity, 0)}{' '}
                    {t('Cart.items')}):{' '}
                    <span className='font-bold'>
                      <ProductPrice price={itemsPrice} plain />
                    </span>{' '}
                  </div>

                  {/* Fulfillment Method Selection */}
                  <div className='space-y-3'>
                    <p className='font-semibold text-sm'>
                      Choose Fulfillment Method
                    </p>
                    <RadioGroup
                      value={fulfillmentMethod ?? ''}
                      onValueChange={(v) =>
                        setFulfillmentMethod(
                          v as 'store-pickup' | 'home-delivery'
                        )
                      }
                      className='space-y-2'
                    >
                      {/* Store Pickup */}
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${fulfillmentMethod === 'store-pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem
                            value='store-pickup'
                            id='store-pickup'
                          />
                          <Label
                            htmlFor='store-pickup'
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
                            <p className='text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-1'>
                              Zero delivery charge. Pick up at our store.
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Home Delivery */}
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${fulfillmentMethod === 'home-delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}
                      >
                        <div className='flex items-center gap-2'>
                          <RadioGroupItem
                            value='home-delivery'
                            id='home-delivery'
                          />
                          <Label
                            htmlFor='home-delivery'
                            className='cursor-pointer flex items-center gap-2 font-semibold'
                          >
                            <Truck className='h-4 w-4 text-blue-600' />
                            Home Delivery
                          </Label>
                        </div>
                        {fulfillmentMethod === 'home-delivery' && (
                          <div className='mt-2 ml-6'>
                            <p className='text-xs text-blue-700 bg-blue-50 rounded px-2 py-1'>
                              Delivery charge varies by location. An additional
                              delivery fee will be applied based on your address
                              after purchase.
                            </p>
                          </div>
                        )}
                      </div>
                    </RadioGroup>
                  </div>

                  <Button
                    onClick={() => router.push('/checkout')}
                    disabled={!fulfillmentMethod}
                    className='rounded-full w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold disabled:opacity-50'
                  >
                    {t('Cart.Proceed to Checkout')}
                  </Button>
                  {!fulfillmentMethod && (
                    <p className='text-xs text-center text-muted-foreground'>
                      Please select a fulfillment method to continue.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
      <BrowsingHistoryList className='mt-10' />
    </div>
  )
}
