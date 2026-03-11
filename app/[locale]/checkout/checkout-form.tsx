'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { createOrder } from '@/lib/actions/order.actions'
import {
  calculateFutureDate,
  formatDateTime,
  timeUntilMidnight,
} from '@/lib/utils'
import { ShippingAddressSchema } from '@/lib/validator'
import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { SubmitHandler, useForm } from 'react-hook-form'
import CheckoutFooter from './checkout-footer'
import { ShippingAddress } from '@/types'
import useIsMounted from '@/hooks/use-is-mounted'
import Link from 'next/link'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import ProductPrice from '@/components/shared/product/product-price'
import { MapPin, Phone, Mail, Store } from 'lucide-react'
import { z } from 'zod'

const PickupDetailsSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(1, 'Phone number is required'),
})
type PickupDetails = z.infer<typeof PickupDetailsSchema>

const shippingAddressDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        fullName: 'Basir',
        street: '1911, 65 Sherbrooke Est',
        city: 'Montreal',
        province: 'Quebec',
        phone: '4181234567',
        postalCode: 'H2X 1C4',
        country: 'Canada',
      }
    : {
        fullName: '',
        street: '',
        city: '',
        province: '',
        phone: '',
        postalCode: '',
        country: '',
      }

const CheckoutForm = () => {
  const { toast } = useToast()
  const router = useRouter()
  const {
    setting: {
      site,
      availablePaymentMethods,
      defaultPaymentMethod,
      availableDeliveryDates,
    },
  } = useSettingStore()

  const {
    cart: {
      items,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      shippingAddress,
      deliveryDateIndex,
      paymentMethod = defaultPaymentMethod,
      fulfillmentMethod,
    },
    setShippingAddress,
    setPaymentMethod,
    updateItem,
    removeItem,
    clearCart,
    setDeliveryDateIndex,
  } = useCartStore()
  const isMounted = useIsMounted()
  const isStorePickup = fulfillmentMethod === 'store-pickup'

  const shippingAddressForm = useForm<ShippingAddress>({
    resolver: zodResolver(ShippingAddressSchema),
    defaultValues: shippingAddress || shippingAddressDefaultValues,
  })
  const onSubmitShippingAddress: SubmitHandler<ShippingAddress> = (values) => {
    setShippingAddress(values)
    setIsAddressSelected(true)
  }

  const pickupDetailsForm = useForm<PickupDetails>({
    resolver: zodResolver(PickupDetailsSchema),
    defaultValues: { fullName: '', phone: '' },
  })
  const onSubmitPickupDetails: SubmitHandler<PickupDetails> = (values) => {
    setShippingAddress({
      fullName: values.fullName,
      phone: values.phone,
      street: 'Store Pickup',
      city: site.name,
      postalCode: 'N/A',
      province: 'N/A',
      country: 'UAE',
    })
    setIsAddressSelected(true)
    setIsDeliveryDateSelected(true)
  }

  useEffect(() => {
    if (!isMounted || !shippingAddress) return
    shippingAddressForm.setValue('fullName', shippingAddress.fullName)
    shippingAddressForm.setValue('street', shippingAddress.street)
    shippingAddressForm.setValue('city', shippingAddress.city)
    shippingAddressForm.setValue('country', shippingAddress.country)
    shippingAddressForm.setValue('postalCode', shippingAddress.postalCode)
    shippingAddressForm.setValue('province', shippingAddress.province)
    shippingAddressForm.setValue('phone', shippingAddress.phone)
  }, [items, isMounted, router, shippingAddress, shippingAddressForm])

  const [isAddressSelected, setIsAddressSelected] = useState<boolean>(false)
  const [isPaymentMethodSelected, setIsPaymentMethodSelected] =
    useState<boolean>(false)
  const [isDeliveryDateSelected, setIsDeliveryDateSelected] =
    useState<boolean>(false)

  const handlePlaceOrder = async () => {
    const expectedDeliveryDate = isStorePickup
      ? calculateFutureDate(1)
      : calculateFutureDate(
          availableDeliveryDates[deliveryDateIndex!].daysToDeliver
        )
    const res = await createOrder({
      items,
      shippingAddress,
      expectedDeliveryDate,
      deliveryDateIndex,
      paymentMethod,
      itemsPrice,
      shippingPrice,
      taxPrice,
      totalPrice,
      fulfillmentMethod: fulfillmentMethod ?? 'home-delivery',
    })
    if (!res.success) {
      toast({
        description: res.message,
        variant: 'destructive',
      })
    } else {
      toast({
        description: res.message,
        variant: 'default',
      })
      clearCart()
      router.push(`/checkout/${res.data?.orderId}`)
    }
  }
  const handleSelectPaymentMethod = () => {
    setIsAddressSelected(true)
    setIsPaymentMethodSelected(true)
  }
  const handleSelectShippingAddress = () => {
    if (isStorePickup) {
      pickupDetailsForm.handleSubmit(onSubmitPickupDetails)()
    } else {
      shippingAddressForm.handleSubmit(onSubmitShippingAddress)()
    }
  }
  const CheckoutSummary = () => (
    <Card>
      <CardContent className='p-4'>
        {!isAddressSelected && (
          <div className='border-b mb-4'>
            <Button
              className='rounded-full w-full font-semibold'
              onClick={handleSelectShippingAddress}
            >
              Ship to this address
            </Button>
            <p className='text-xs text-center py-2'>
              Choose a shipping address and payment method in order to calculate
              shipping, handling, and tax.
            </p>
          </div>
        )}
        {isAddressSelected && !isPaymentMethodSelected && (
          <div className=' mb-4'>
            <Button
              className='rounded-full w-full font-semibold'
              onClick={handleSelectPaymentMethod}
            >
              Use this payment method
            </Button>

            <p className='text-xs text-center py-2'>
              Choose a payment method to continue checking out. You&apos;ll
              still have a chance to review and edit your order before it&apos;s
              final.
            </p>
          </div>
        )}
        {isPaymentMethodSelected && isAddressSelected && (
          <div>
            <Button
              onClick={handlePlaceOrder}
              className='rounded-full w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
            >
              Place Your Order
            </Button>
            <p className='text-xs text-center py-2'>
              By placing your order, you agree to {site.name}&apos;s{' '}
              <Link href='/page/privacy-policy'>privacy notice</Link> and
              <Link href='/page/conditions-of-use'> conditions of use</Link>.
            </p>
          </div>
        )}

        <div>
          <div className='text-lg font-bold'>Order Summary</div>
          <div className='space-y-2'>
            <div className='flex justify-between'>
              <span>Items:</span>
              <span>
                <ProductPrice price={itemsPrice} plain />
              </span>
            </div>
            <div className='flex justify-between'>
              <span>Shipping & Handling:</span>
              <span>
                {shippingPrice === undefined ? (
                  '--'
                ) : shippingPrice === 0 ? (
                  'FREE'
                ) : (
                  <ProductPrice price={shippingPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between'>
              <span> Tax:</span>
              <span>
                {taxPrice === undefined ? (
                  '--'
                ) : (
                  <ProductPrice price={taxPrice} plain />
                )}
              </span>
            </div>
            <div className='flex justify-between  pt-4 font-bold text-lg'>
              <span> Order Total:</span>
              <span>
                <ProductPrice price={totalPrice} plain />
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <main className='max-w-6xl mx-auto highlight-link'>
      <div className='grid md:grid-cols-4 gap-6'>
        <div className='md:col-span-3'>
          {/* shipping address / pickup details */}
          <div>
            {isAddressSelected && shippingAddress ? (
              <div className='grid grid-cols-1 md:grid-cols-12    my-3  pb-3'>
                <div className='col-span-5 flex text-lg font-bold '>
                  <span className='w-8'>1 </span>
                  <span>{isStorePickup ? 'Pickup Details' : 'Shipping address'}</span>
                </div>
                <div className='col-span-5 '>
                  {isStorePickup ? (
                    <div className='space-y-1'>
                      <p className='font-semibold'>{shippingAddress.fullName}</p>
                      <p className='text-sm text-muted-foreground'>{shippingAddress.phone}</p>
                      <p className='text-sm text-green-700 font-medium'>Store Pickup — FREE</p>
                    </div>
                  ) : (
                    <p>
                      {shippingAddress.fullName} <br />
                      {shippingAddress.street} <br />
                      {`${shippingAddress.city}, ${shippingAddress.province}, ${shippingAddress.postalCode}, ${shippingAddress.country}`}
                    </p>
                  )}
                </div>
                <div className='col-span-2'>
                  <Button
                    variant={'outline'}
                    onClick={() => {
                      setIsAddressSelected(false)
                      setIsPaymentMethodSelected(false)
                      setIsDeliveryDateSelected(false)
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : isStorePickup ? (
              /* ── Store Pickup: ask only name + phone ── */
              <>
                <div className='flex text-primary text-lg font-bold my-2'>
                  <span className='w-8'>1 </span>
                  <span>Pickup Details</span>
                </div>
                {/* Store info box */}
                <Card className='md:ml-8 my-3 border-green-200 bg-green-50 dark:bg-green-950/20'>
                  <CardContent className='p-4 space-y-2'>
                    <div className='flex items-center gap-2 font-semibold text-green-700 dark:text-green-400'>
                      <Store className='h-4 w-4' />
                      Collect from Our Store — Zero Delivery Charge
                    </div>
                    <div className='space-y-1.5 text-sm text-muted-foreground'>
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
                  </CardContent>
                </Card>
                <Form {...pickupDetailsForm}>
                  <form
                    method='post'
                    onSubmit={pickupDetailsForm.handleSubmit(onSubmitPickupDetails)}
                    className='space-y-4'
                  >
                    <Card className='md:ml-8 my-4'>
                      <CardContent className='p-4 space-y-3'>
                        <div className='text-base font-bold mb-1'>
                          Your Contact Details
                        </div>
                        <div className='flex flex-col gap-4 md:flex-row'>
                          <FormField
                            control={pickupDetailsForm.control}
                            name='fullName'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder='Enter your full name' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={pickupDetailsForm.control}
                            name='phone'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder='Enter your phone number' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className='p-4'>
                        <Button type='submit' className='rounded-full font-semibold'>
                          Confirm Pickup
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            ) : (
              /* ── Home Delivery: full address form ── */
              <>
                <div className='flex text-primary text-lg font-bold my-2'>
                  <span className='w-8'>1 </span>
                  <span>Enter shipping address</span>
                </div>
                <Form {...shippingAddressForm}>
                  <form
                    method='post'
                    onSubmit={shippingAddressForm.handleSubmit(
                      onSubmitShippingAddress
                    )}
                    className='space-y-4'
                  >
                    <Card className='md:ml-8 my-4'>
                      <CardContent className='p-4 space-y-2'>
                        <div className='text-lg font-bold mb-2'>
                          Your address
                        </div>

                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='fullName'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Enter full name'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div>
                          <FormField
                            control={shippingAddressForm.control}
                            name='street'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Address</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Enter address'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='city'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                  <Input placeholder='Enter city' {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='province'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Province</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Enter province'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='country'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Enter country'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        <div className='flex flex-col gap-5 md:flex-row'>
                          <FormField
                            control={shippingAddressForm.control}
                            name='postalCode'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Enter postal code'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={shippingAddressForm.control}
                            name='phone'
                            render={({ field }) => (
                              <FormItem className='w-full'>
                                <FormLabel>Phone number</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder='Enter phone number'
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </CardContent>
                      <CardFooter className='  p-4'>
                        <Button
                          type='submit'
                          className='rounded-full font-semibold'
                        >
                          Ship to this address
                        </Button>
                      </CardFooter>
                    </Card>
                  </form>
                </Form>
              </>
            )}
          </div>
          {/* payment method */}
          <div className='border-y'>
            {isPaymentMethodSelected && paymentMethod ? (
              <div className='grid  grid-cols-1 md:grid-cols-12  my-3 pb-3'>
                <div className='flex text-lg font-bold  col-span-5'>
                  <span className='w-8'>2 </span>
                  <span>Payment Method</span>
                </div>
                <div className='col-span-5 '>
                  <p>{paymentMethod}</p>
                </div>
                <div className='col-span-2'>
                  <Button
                    variant='outline'
                    onClick={() => {
                      setIsPaymentMethodSelected(false)
                      if (paymentMethod) setIsDeliveryDateSelected(true)
                    }}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : isAddressSelected ? (
              <>
                <div className='flex text-primary text-lg font-bold my-2'>
                  <span className='w-8'>2 </span>
                  <span>Choose a payment method</span>
                </div>
                <Card className='md:ml-8 my-4'>
                  <CardContent className='p-4'>
                    <RadioGroup
                      value={paymentMethod}
                      onValueChange={(value) => setPaymentMethod(value)}
                    >
                      {availablePaymentMethods.map((pm) => (
                        <div key={pm.name} className='flex items-center py-1 '>
                          <RadioGroupItem
                            value={pm.name}
                            id={`payment-${pm.name}`}
                          />
                          <Label
                            className='font-bold pl-2 cursor-pointer'
                            htmlFor={`payment-${pm.name}`}
                          >
                            {pm.name}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                  <CardFooter className='p-4'>
                    <Button
                      onClick={handleSelectPaymentMethod}
                      className='rounded-full font-semibold'
                    >
                      Use this payment method
                    </Button>
                  </CardFooter>
                </Card>
              </>
            ) : (
              <div className='flex text-muted-foreground text-lg font-bold my-4 py-3'>
                <span className='w-8'>2 </span>
                <span>Choose a payment method</span>
              </div>
            )}
          </div>
          {/* items and delivery date */}
          <div>
            {isDeliveryDateSelected && (isStorePickup || deliveryDateIndex != undefined) ? (
              <div className='grid  grid-cols-1 md:grid-cols-12  my-3 pb-3'>
                <div className='flex text-lg font-bold  col-span-5'>
                  <span className='w-8'>3 </span>
                  <span>Items and shipping</span>
                </div>
                <div className='col-span-5'>
                  {isStorePickup ? (
                    <p className='text-green-700 font-semibold'>Store Pickup — FREE</p>
                  ) : (
                    <p>
                      Delivery date:{' '}
                      {
                        formatDateTime(
                          calculateFutureDate(
                            availableDeliveryDates[deliveryDateIndex!]
                              .daysToDeliver
                          )
                        ).dateOnly
                      }
                    </p>
                  )}
                  <ul>
                    {items.map((item, _index) => (
                      <li key={_index}>
                        {item.name} x {item.quantity} = {item.price}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className='col-span-2'>
                  {!isStorePickup && (
                    <Button
                      variant={'outline'}
                      onClick={() => {
                        setIsPaymentMethodSelected(true)
                        setIsDeliveryDateSelected(false)
                      }}
                    >
                      Change
                    </Button>
                  )}
                </div>
              </div>
            ) : isPaymentMethodSelected && isAddressSelected ? (
              <>
                <div className='flex text-primary  text-lg font-bold my-2'>
                  <span className='w-8'>3 </span>
                  <span>Review items and shipping</span>
                </div>
                <Card className='md:ml-8'>
                  <CardContent className='p-4'>
                    {isStorePickup ? (
                      <div className='mb-4 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200'>
                        <p className='text-green-700 dark:text-green-400 font-semibold'>
                          Store Pickup — Zero Delivery Charge
                        </p>
                        <p className='text-sm text-muted-foreground mt-1'>
                          Your order will be ready for collection. We will
                          contact you when it is ready.
                        </p>
                      </div>
                    ) : (
                      <p className='mb-2'>
                        <span className='text-lg font-bold text-green-700'>
                          Arriving{' '}
                          {
                            formatDateTime(
                              calculateFutureDate(
                                availableDeliveryDates[deliveryDateIndex!]
                                  .daysToDeliver
                              )
                            ).dateOnly
                          }
                        </span>{' '}
                        If you order in the next {timeUntilMidnight().hours} hours
                        and {timeUntilMidnight().minutes} minutes.
                      </p>
                    )}
                    <div className='grid md:grid-cols-2 gap-6'>
                      <div>
                        {items.map((item, _index) => (
                          <div key={_index} className='flex gap-4 py-2'>
                            <div className='relative w-16 h-16'>
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

                            <div className='flex-1'>
                              <p className='font-semibold'>
                                {item.name}, {item.color}, {item.size}
                              </p>
                              <p className='font-bold'>
                                <ProductPrice price={item.price} plain />
                              </p>

                              <Select
                                value={item.quantity.toString()}
                                onValueChange={(value) => {
                                  if (value === '0') removeItem(item)
                                  else updateItem(item, Number(value))
                                }}
                              >
                                <SelectTrigger className='w-24'>
                                  <SelectValue>
                                    Qty: {item.quantity}
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
                                  <SelectItem key='delete' value='0'>
                                    Delete
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                      {!isStorePickup && (
                        <div>
                          <div className=' font-bold'>
                            <p className='mb-2'> Choose a shipping speed:</p>

                            <ul>
                              <RadioGroup
                                value={
                                  availableDeliveryDates[deliveryDateIndex!].name
                                }
                                onValueChange={(value) =>
                                  setDeliveryDateIndex(
                                    availableDeliveryDates.findIndex(
                                      (address) => address.name === value
                                    )!
                                  )
                                }
                              >
                                {availableDeliveryDates.map((dd) => (
                                  <div key={dd.name} className='flex'>
                                    <RadioGroupItem
                                      value={dd.name}
                                      id={`address-${dd.name}`}
                                    />
                                    <Label
                                      className='pl-2 space-y-2 cursor-pointer'
                                      htmlFor={`address-${dd.name}`}
                                    >
                                      <div className='text-green-700 font-semibold'>
                                        {
                                          formatDateTime(
                                            calculateFutureDate(dd.daysToDeliver)
                                          ).dateOnly
                                        }
                                      </div>
                                      <div>
                                        {(dd.freeShippingMinPrice > 0 &&
                                        itemsPrice >= dd.freeShippingMinPrice
                                          ? 0
                                          : dd.shippingPrice) === 0 ? (
                                          'FREE Shipping'
                                        ) : (
                                          <ProductPrice
                                            price={dd.shippingPrice}
                                            plain
                                          />
                                        )}
                                      </div>
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </ul>
                          </div>
                          <p className='text-xs text-blue-700 bg-blue-50 dark:bg-blue-950/20 rounded px-2 py-1.5 mt-3'>
                            Note: Delivery charge may vary based on your
                            location. An additional fee may be applied after
                            purchase.
                          </p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <div className='flex text-muted-foreground text-lg font-bold my-4 py-3'>
                <span className='w-8'>3 </span>
                <span>Items and shipping</span>
              </div>
            )}
          </div>
          {isPaymentMethodSelected && isAddressSelected && (
            <div className='mt-6'>
              <div className='block md:hidden'>
                <CheckoutSummary />
              </div>

              <Card className='hidden md:block '>
                <CardContent className='p-4 flex flex-col md:flex-row justify-between items-center gap-3'>
                  <Button
                    onClick={handlePlaceOrder}
                    className='rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
                  >
                    Place Your Order
                  </Button>
                  <div className='flex-1'>
                    <p className='font-bold text-lg'>
                      Order Total: <ProductPrice price={totalPrice} plain />
                    </p>
                    <p className='text-xs'>
                      {' '}
                      By placing your order, you agree to {
                        site.name
                      }&apos;s{' '}
                      <Link href='/page/privacy-policy'>privacy notice</Link>{' '}
                      and
                      <Link href='/page/conditions-of-use'>
                        {' '}
                        conditions of use
                      </Link>
                      .
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          <CheckoutFooter />
        </div>
        <div className='hidden md:block'>
          <CheckoutSummary />
        </div>
      </div>
    </main>
  )
}
export default CheckoutForm
