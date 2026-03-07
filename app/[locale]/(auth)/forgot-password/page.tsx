import { Metadata } from 'next'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { getSetting } from '@/lib/actions/setting.actions'
import ForgotPasswordForm from './forgot-password-form'

export const metadata: Metadata = {
  title: 'Forgot Password',
}

export default async function ForgotPasswordPage() {
  const { site } = await getSetting()

  return (
    <div className='w-full'>
      <Card className='shadow-md border-border/60'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Forgot your password?
          </CardTitle>
          <CardDescription>
            Enter your {site.name} account email and we&apos;ll send you a
            reset link.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ForgotPasswordForm />
        </CardContent>
      </Card>
    </div>
  )
}
