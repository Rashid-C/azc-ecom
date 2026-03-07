import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import ResetPasswordForm from './reset-password-form'

export const metadata: Metadata = {
  title: 'Reset Password',
}

export default async function ResetPasswordPage(props: {
  searchParams: Promise<{ token?: string }>
}) {
  const { token } = await props.searchParams

  if (!token) redirect('/forgot-password')

  return (
    <div className='w-full'>
      <Card className='shadow-md border-border/60'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Set a new password
          </CardTitle>
          <CardDescription>
            Enter your new password below. It must be at least 6 characters.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResetPasswordForm token={token} />
        </CardContent>
      </Card>
    </div>
  )
}
