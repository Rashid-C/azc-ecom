
'use server'
import { Cart, OrderItem, ShippingAddress } from '@/types'
import { formatCurrency, formatDateTime, formatError, round2 } from '../utils'
import { AVAILABLE_DELIVERY_DATES } from '../constants'
import { connectToDatabase } from '../db'
import { auth } from '@/auth'
import { OrderInputSchema } from '../validator'
import Order, { IOrder } from '../db/models/order.model'
import { Resend } from 'resend'
import { sendPurchaseReceipt } from '@/emails'
import { revalidatePath } from 'next/cache'
import { paypal } from '../paypal'

const resend = process.env.RESEND_API_KEY
    ? new Resend(process.env.RESEND_API_KEY)
    : null

const getSenderEmail = () => {
    const senderEmail = process.env.SENDER_EMAIL?.trim()
    const senderName = process.env.SENDER_NAME?.trim()
    if (!senderEmail) return null
    return senderName ? `${senderName} <${senderEmail}>` : senderEmail
}

const sendOrderConfirmationEmail = async ({
    to,
    orderId,
    totalPrice,
    expectedDeliveryDate,
}: {
    to?: string | null
    orderId: string
    totalPrice: number
    expectedDeliveryDate: Date
}) => {
    try {
        if (!resend || !to) return

        const from = getSenderEmail()
        if (!from) return

        const deliveryDate = formatDateTime(expectedDeliveryDate).dateOnly
        const total = formatCurrency(totalPrice)

        const { error } = await resend.emails.send({
            from,
            to,
            subject: `Order confirmation #${orderId}`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.5;">
                    <h2>Thanks for your order</h2>
                    <p>Your order <strong>#${orderId}</strong> has been placed successfully.</p>
                    <p><strong>Total:</strong> ${total}</p>
                    <p><strong>Expected delivery:</strong> ${deliveryDate}</p>
                </div>
            `,
            text: `Thanks for your order. Order #${orderId} has been placed successfully. Total: ${total}. Expected delivery: ${deliveryDate}.`,
        })

        if (error) {
            console.error('Failed to send order confirmation email:', error.message)
        }
    } catch (error) {
        console.error('Unexpected email error:', formatError(error))
    }
}

// CREATE
export const createOrder = async (clientSideCart: Cart) => {
    try {
        await connectToDatabase()
        const session = await auth()
        if (!session) throw new Error('User not authenticated')
        // recalculate price and delivery date on the server
        const createdOrder = await createOrderFromCart(
            clientSideCart,
            session.user.id!
        )

        await sendOrderConfirmationEmail({
            to: session.user.email,
            orderId: createdOrder._id.toString(),
            totalPrice: createdOrder.totalPrice,
            expectedDeliveryDate: createdOrder.expectedDeliveryDate,
        })

        return {
            success: true,
            message: 'Order placed successfully',
            data: { orderId: createdOrder._id.toString() },
        }
    } catch (error) {
        return { success: false, message: formatError(error) }
    }
}
export const createOrderFromCart = async (
    clientSideCart: Cart,
    userId: string
) => {
    const cart = {
        ...clientSideCart,
        ...(await calcDeliveryDateAndPrice({
            items: clientSideCart.items,
            shippingAddress: clientSideCart.shippingAddress,
            deliveryDateIndex: clientSideCart.deliveryDateIndex,
        })),
    }

    const order = OrderInputSchema.parse({
        user: userId,
        items: cart.items,
        shippingAddress: cart.shippingAddress,
        paymentMethod: cart.paymentMethod,
        itemsPrice: cart.itemsPrice,
        shippingPrice: cart.shippingPrice,
        taxPrice: cart.taxPrice,
        totalPrice: cart.totalPrice,
        expectedDeliveryDate: cart.expectedDeliveryDate,
    })
    return await Order.create(order)
}




export async function getOrderById(orderId: string): Promise<IOrder> {
  await connectToDatabase()
  const order = await Order.findById(orderId)
  return JSON.parse(JSON.stringify(order))
}

export async function createPayPalOrder(orderId: string) {
  await connectToDatabase()
  try {
    const order = await Order.findById(orderId)
    if (order) {
      const paypalOrder = await paypal.createOrder(order.totalPrice)
      order.paymentResult = {
        id: paypalOrder.id,
        email_address: '',
        status: '',
        pricePaid: '0',
      }
      await order.save()
      return {
        success: true,
        message: 'PayPal order created successfully',
        data: paypalOrder.id,
      }
    } else {
      throw new Error('Order not found')
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}

export async function approvePayPalOrder(
  orderId: string,
  data: { orderID: string }
) {
  await connectToDatabase()
  try {
    const order = await Order.findById(orderId).populate('user', 'email')
    if (!order) throw new Error('Order not found')

    const captureData = await paypal.capturePayment(data.orderID)
    if (
      !captureData ||
      captureData.id !== order.paymentResult?.id ||
      captureData.status !== 'COMPLETED'
    )
      throw new Error('Error in paypal payment')
    order.isPaid = true
    order.paidAt = new Date()
    order.paymentResult = {
      id: captureData.id,
      status: captureData.status,
      email_address: captureData.payer.email_address,
      pricePaid:
        captureData.purchase_units[0]?.payments?.captures[0]?.amount?.value,
    }
    await order.save()
    await sendPurchaseReceipt({ order })
    revalidatePath(`/account/orders/${orderId}`)
    return {
      success: true,
      message: 'Your order has been successfully paid by PayPal',
    }
  } catch (err) {
    return { success: false, message: formatError(err) }
  }
}


export const calcDeliveryDateAndPrice = async ({
    items,
    shippingAddress,
    deliveryDateIndex,
}: {
    deliveryDateIndex?: number
    items: OrderItem[]
    shippingAddress?: ShippingAddress

}) => {
    const itemsPrice = round2(
        items.reduce((acc, item) => acc + item.price * item.quantity, 0)
    )



    const deliveryDate =
        AVAILABLE_DELIVERY_DATES[
        deliveryDateIndex === undefined
            ? AVAILABLE_DELIVERY_DATES.length - 1
            : deliveryDateIndex
        ]
    const shippingPrice =
        !shippingAddress || !deliveryDate
            ? undefined
            : deliveryDate.freeShippingMinPrice > 0 &&
                itemsPrice >= deliveryDate.freeShippingMinPrice
                ? 0
                : deliveryDate.shippingPrice

    const taxPrice = !shippingAddress ? undefined : round2(itemsPrice * 0.15)


    const totalPrice = round2(
        itemsPrice +
        (shippingPrice ? round2(shippingPrice) : 0) +
        (taxPrice ? round2(taxPrice) : 0)
    )
    return {

        AVAILABLE_DELIVERY_DATES,
        deliveryDateIndex:
            deliveryDateIndex === undefined
                ? AVAILABLE_DELIVERY_DATES.length - 1
                : deliveryDateIndex,
        itemsPrice,
        shippingPrice,
        taxPrice,
        totalPrice,
    }
}

