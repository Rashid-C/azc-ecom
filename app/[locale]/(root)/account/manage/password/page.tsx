import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { SessionProvider } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PasswordForm from './password-form'

export const metadata: Metadata = {
  title: 'Change Password',
}

export default async function ChangePasswordPage() {
  const session = await auth()
  if (!session) redirect('/sign-in?callbackUrl=/account/manage/password')

  return (
    <div className='mb-24'>
      <SessionProvider session={session}>
        <div className='flex gap-2'>
          <Link href='/account'>Your Account</Link>
          <span>›</span>
          <Link href='/account/manage'>Login &amp; Security</Link>
          <span>›</span>
          <span>Change Password</span>
        </div>

        <h1 className='h1-bold py-4'>Change Password</h1>

        <Card className='max-w-md'>
          <CardHeader className='pb-2'>
            <CardTitle className='text-base font-medium text-muted-foreground'>
              Choose a strong password with at least 8 characters.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PasswordForm />
          </CardContent>
        </Card>
      </SessionProvider>
    </div>
  )
}
