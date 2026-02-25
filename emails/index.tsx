import { Resend } from 'resend'
import PurchaseReceiptEmail, { PurchaseReceiptOrder } from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.model'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'
import { formatId } from '@/lib/utils'

const resendApiKey = process.env.RESEND_API_KEY?.trim()
const resend = resendApiKey ? new Resend(resendApiKey) : null

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
    if (!resend) {
        throw new Error('RESEND_API_KEY is missing')
    }

    const purchaseReceiptOrder: PurchaseReceiptOrder = {
        _id: order._id.toString(),
        createdAt: order.createdAt,
        totalPrice: order.totalPrice,
        itemsPrice: order.itemsPrice,
        taxPrice: order.taxPrice,
        shippingPrice: order.shippingPrice,
        user: order.user as { name: string; email: string },
        shippingAddress: order.shippingAddress,
        items: order.items,
        paymentMethod: order.paymentMethod,
        expectedDeliveryDate: order.expectedDeliveryDate,
        isDelivered: order.isDelivered,
        isPaid: order.isPaid,
        paidAt: order.paidAt,
    }

    const reactEmail = await PurchaseReceiptEmail({ order: purchaseReceiptOrder })
    const { error } = await resend.emails.send({
        from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
        to: (order.user as { email: string }).email,
        subject: `Order ${formatId(order._id.toString())} Confirmation`,
        react: reactEmail,
    })

    if (error) {
        throw new Error(error.message)
    }
}
