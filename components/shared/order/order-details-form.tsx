'use client'

import Image from 'next/image'
import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { IOrder } from '@/lib/db/models/order.model'
import { cn, formatDateTime } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import ProductPrice from '../product/product-price'
import ActionButton from '../action-button'
import { deliverOrder, updateOrderToPaid } from '@/lib/actions/order.actions'
import {
  MapPin,
  CreditCard,
  Calendar,
  CheckCircle2,
  Clock,
  Package,
  Truck,
} from 'lucide-react'

export default function OrderDetailsForm({
  order,
  isAdmin,
}: {
  order: IOrder
  isAdmin: boolean
}) {
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
  } = order

  return (
    <div className='grid md:grid-cols-3 md:gap-5'>
      <div className='md:col-span-2 space-y-4'>

        {/* Shipping Address */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <MapPin className='h-4 w-4 text-primary' />
              Shipping Address
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <div>
              <p className='font-medium'>{shippingAddress.fullName}</p>
              <p className='text-sm text-muted-foreground'>{shippingAddress.phone}</p>
              <p className='text-sm text-muted-foreground mt-1'>
                {shippingAddress.street}, {shippingAddress.city},{' '}
                {shippingAddress.province}, {shippingAddress.postalCode},{' '}
                {shippingAddress.country}
              </p>
            </div>
            <Separator />
            {isDelivered ? (
              <div className='flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                <span className='font-medium'>
                  Delivered at {formatDateTime(deliveredAt!).dateTime}
                </span>
              </div>
            ) : (
              <div className='space-y-2'>
                <div className='flex items-center gap-2'>
                  <Badge variant='destructive' className='gap-1'>
                    <Truck className='h-3 w-3' />
                    Not delivered
                  </Badge>
                </div>
                <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                  <Clock className='h-4 w-4 shrink-0 text-amber-500' />
                  <span>
                    Expected delivery:{' '}
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
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <CreditCard className='h-4 w-4 text-primary' />
              Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
            <p className='font-medium'>{paymentMethod}</p>
            <Separator />
            {isPaid ? (
              <div className='flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400'>
                <CheckCircle2 className='h-4 w-4 shrink-0' />
                <span className='font-medium'>
                  Paid at {formatDateTime(paidAt!).dateTime}
                </span>
              </div>
            ) : (
              <div className='flex items-center gap-2'>
                <Badge variant='destructive' className='gap-1'>
                  <Calendar className='h-3 w-3' />
                  Not paid
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Order Items */}
        <Card>
          <CardHeader className='pb-3'>
            <CardTitle className='flex items-center gap-2 text-base'>
              <Package className='h-4 w-4 text-primary' />
              Order Items
            </CardTitle>
          </CardHeader>
          <CardContent className='p-0'>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead className='text-center'>Qty</TableHead>
                  <TableHead className='text-right'>Price</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.slug}>
                    <TableCell>
                      <Link
                        href={`/product/${item.slug}`}
                        className='flex items-center gap-3 hover:opacity-80 transition-opacity'
                      >
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={48}
                          height={48}
                          className='rounded-md border object-cover aspect-square'
                        />
                        <span className='text-sm font-medium line-clamp-2'>
                          {item.name}
                        </span>
                      </Link>
                    </TableCell>
                    <TableCell className='text-center text-sm'>
                      {item.quantity}
                    </TableCell>
                    <TableCell className='text-right text-sm font-medium'>
                      <ProductPrice price={item.price} plain />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div>
        <Card className='sticky top-4'>
          <CardHeader className='pb-3'>
            <CardTitle className='text-base'>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className='space-y-3'>
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
              <div className='flex justify-between font-semibold text-base'>
                <span>Total</span>
                <ProductPrice price={totalPrice} plain />
              </div>
            </div>

            {!isPaid && ['Stripe', 'PayPal'].includes(paymentMethod) && (
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
            {isAdmin && !isPaid && paymentMethod === 'Cash On Delivery' && (
              <ActionButton
                caption='Mark as paid'
                action={() => updateOrderToPaid(order._id.toString())}
                className='w-full font-semibold'
              />
            )}
            {isAdmin && isPaid && !isDelivered && (
              <ActionButton
                caption='Mark as delivered'
                action={() => deliverOrder(order._id.toString())}
                className='w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold'
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
