'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { IOrder } from '@/lib/db/models/order.model'
import { cn, formatDateTime } from '@/lib/utils'
import { Button, buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import { cancelOrder, deliverOrder, updateOrderToPaid } from '@/lib/actions/order.actions'
import {
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Truck,
  User,
  Phone,
  XCircle,
} from 'lucide-react'
import OrderInvoicePdf, { InvoiceSite } from './order-invoice-pdf'

export default function OrderDetailsForm({
  order,
  isAdmin,
  site,
}: {
  order: IOrder
  isAdmin: boolean
  site?: InvoiceSite
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [isCancelling, startCancelTransition] = useTransition()
  const [localCancelled, setLocalCancelled] = useState(order.isCancelled)
  const {
    shippingAddress,
    items,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    isPaid,
    paidAt,
    isDelivered,
    deliveredAt,
    expectedDeliveryDate,
    cancelledAt,
  } = order
  const isCancelled = localCancelled

  useEffect(() => {
    setLocalCancelled(order.isCancelled)
  }, [order.isCancelled])

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>

      {/* ── Order Summary (top on mobile, right column on desktop) ── */}
      <div className='order-1 md:order-2 md:col-start-3'>
        <Card className='md:sticky md:top-4'>
          <CardHeader className='pb-3 border-b bg-muted/30'>
            <CardTitle className='text-base font-bold'>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className='pt-4 space-y-3'>
            <div className='space-y-2 text-sm'>
              <div className='flex justify-between text-muted-foreground'>
                <span>Items</span>
                <ProductPrice price={itemsPrice} plain />
              </div>
              <div className='flex justify-between text-muted-foreground'>
                <span>Tax</span>
                <ProductPrice price={taxPrice} plain />
              </div>
              <div className='flex justify-between text-muted-foreground'>
                <span>Shipping</span>
                <ProductPrice price={shippingPrice} plain />
              </div>
              <Separator />
              <div className='flex justify-between font-bold text-base'>
                <span>Total</span>
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>

            {site && (
              <OrderInvoicePdf order={order} site={site} />
            )}
            {!isCancelled && !isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
              <Link
                className={cn(
                  buttonVariants(),
                  'w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold mt-2'
                )}
                href={`/checkout/${order._id.toString()}`}
              >
                Pay Order
              </Link>
            )}
            {isAdmin && !isCancelled && !isPaid && paymentMethod === 'Cash On Delivery' && (
              <ActionButton
                caption='Mark as paid'
                action={() => updateOrderToPaid(order._id.toString())}
                className='w-full font-semibold'
              />
            )}
            {isAdmin && !isCancelled && isPaid && !isDelivered && (
              <ActionButton
                caption='Mark as delivered'
                action={() => deliverOrder(order._id.toString())}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
              />
            )}
            {!isAdmin && !isCancelled && !isDelivered && (
              <Button
                disabled={isCancelling}
                onClick={() =>
                  startCancelTransition(async () => {
                    const res = await cancelOrder(order._id.toString())
                    toast({
                      variant: res.success ? 'default' : 'destructive',
                      description: res.message,
                    })
                    if (res.success) {
                      setLocalCancelled(true)
                      router.refresh()
                    }
                  })
                }
                className='w-full rounded-full bg-red-600 hover:bg-red-700 text-white font-semibold'
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </Button>
            )}
            {isCancelled && (
              <div className='flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2'>
                <XCircle className='h-4 w-4 shrink-0 text-red-500' />
                <span className='text-sm font-medium text-red-600 dark:text-red-400'>
                  Cancelled {cancelledAt ? formatDateTime(cancelledAt).dateTime : ''}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Left column (below summary on mobile, col-span-2 on desktop) ── */}
      <div className='order-2 md:order-1 md:col-span-2 space-y-4 mt-4 md:mt-0'>

        {/* Shipping Address */}
        <Card>
          <CardHeader className='pb-0 pt-4 px-4'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
              <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0'>
                <MapPin className='h-3.5 w-3.5 text-primary' />
              </div>
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pt-3 pb-4 space-y-3'>
            <div className='space-y-1.5'>
              <div className='flex items-center gap-2'>
                <User className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                <p className='font-semibold text-sm'>{shippingAddress.fullName}</p>
              </div>
              <div className='flex items-center gap-2'>
                <Phone className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                <p className='text-sm text-muted-foreground'>{shippingAddress.phone}</p>
              </div>
              <div className='flex items-start gap-2'>
                <MapPin className='h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5' />
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  {shippingAddress.street}, {shippingAddress.city},{' '}
                  {shippingAddress.province}, {shippingAddress.postalCode},{' '}
                  {shippingAddress.country}
                </p>
              </div>
            </div>
            <Separator />
            {isCancelled ? (
              <div className='flex items-center gap-2 bg-red-500/10 rounded-lg px-3 py-2'>
                <XCircle className='h-4 w-4 shrink-0 text-red-500' />
                <span className='text-sm font-medium text-red-600 dark:text-red-400'>Order cancelled</span>
              </div>
            ) : isDelivered ? (
              <div className='flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 rounded-lg px-3 py-2'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                <span className='font-medium'>
                  Delivered {formatDateTime(deliveredAt!).dateTime}
                </span>
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='flex items-center gap-2 bg-red-500/8 rounded-lg px-3 py-2'>
                  <Truck className='h-4 w-4 shrink-0 text-red-500' />
                  <span className='text-sm font-medium text-red-600 dark:text-red-400'>Not yet delivered</span>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-3.5 w-3.5 shrink-0 text-amber-500' />
                  <span>
                    Expected:{' '}
                    <span className='font-medium text-foreground'>
                      {formatDateTime(expectedDeliveryDate!).dateTime}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card>
          <CardHeader className='pb-0 pt-4 px-4'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
              <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0'>
                <CreditCard className='h-3.5 w-3.5 text-primary' />
              </div>
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pt-3 pb-4 space-y-3'>
            <p className='font-semibold text-sm'>{paymentMethod}</p>
            <Separator />
            {isPaid ? (
              <div className='flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-500/8 rounded-lg px-3 py-2'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                <span className='font-medium'>
                  Paid {formatDateTime(paidAt!).dateTime}
                </span>
              </div>
            ) : (
              <div className='flex items-center gap-2 bg-amber-500/8 rounded-lg px-3 py-2'>
                <Calendar className='h-4 w-4 shrink-0 text-amber-500' />
                <span className='text-sm font-medium text-amber-600 dark:text-amber-400'>Payment pending</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className='pb-0 pt-4 px-4'>
            <CardTitle className='flex items-center gap-2 text-sm font-semibold text-muted-foreground uppercase tracking-wide'>
              <div className='w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center shrink-0'>
                <Package className='h-3.5 w-3.5 text-primary' />
              </div>
              Order Items
              <Badge variant='secondary' className='ml-auto text-xs font-semibold'>
                {items.length} item{items.length !== 1 ? 's' : ''}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className='px-4 pt-3 pb-2'>
            <div className='divide-y divide-border/60'>
              {items.map((item) => (
                <div key={item.slug} className='flex items-center gap-3 py-3'>
                  <Link href={`/product/${item.slug}`} className='shrink-0'>
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className='rounded-lg border object-cover aspect-square hover:opacity-80 transition-opacity'
                    />
                  </Link>
                  <div className='flex-1 min-w-0'>
                    <Link href={`/product/${item.slug}`}>
                      <p className='text-sm font-medium line-clamp-2 hover:text-primary transition-colors leading-snug'>
                        {item.name}
                      </p>
                    </Link>
                    {item.color && (
                      <p className='text-xs text-muted-foreground mt-0.5'>{item.color}</p>
                    )}
                  </div>
                  <div className='flex flex-col items-end gap-1 shrink-0'>
                    <ProductPrice price={item.price} plain />
                    <span className='text-xs text-muted-foreground'>Qty: {item.quantity}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
