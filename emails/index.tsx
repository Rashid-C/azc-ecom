import { Resend } from 'resend'
import PurchaseReceiptEmail from './purchase-receipt'
import { IOrder } from '@/lib/db/models/order.model'
import AskReviewOrderItemsEmail, { AskReviewOrder } from './ask-review-order-items'
import PasswordResetEmail from './password-reset'
import { SENDER_EMAIL, SENDER_NAME } from '@/lib/constants'

const resend = new Resend(process.env.RESEND_API_KEY as string)

export const sendPurchaseReceipt = async ({ order }: { order: IOrder }) => {
  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Order Confirmation',
    react: <PurchaseReceiptEmail order={order} />,
  })
}

export const sendPasswordResetEmail = async ({
  to,
  name,
  token,
  siteUrl,
  siteName,
}: {
  to: string
  name: string
  token: string
  siteUrl: string
  siteName: string
}) => {
  const resetUrl = `${siteUrl}/reset-password?token=${token}`
  const { error } = await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to,
    subject: `Reset your ${siteName} password`,
    react: <PasswordResetEmail name={name} resetUrl={resetUrl} siteName={siteName} />,
  })
  if (error) throw new Error(error.message)
}

export const sendAskReviewOrderItems = async ({ order }: { order: IOrder }) => {
  const oneDayFromNow = new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString()

  await resend.emails.send({
    from: `${SENDER_NAME} <${SENDER_EMAIL}>`,
    to: (order.user as { email: string }).email,
    subject: 'Review your order items',
    react: <AskReviewOrderItemsEmail order={order as unknown as AskReviewOrder} />,
    scheduledAt: oneDayFromNow,
  })
}