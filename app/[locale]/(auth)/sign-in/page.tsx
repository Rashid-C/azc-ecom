import { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import SeparatorWithOr from '@/components/shared/separator-or'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import CredentialsSignInForm from './credentials-signin-form'
import { GoogleSignInForm } from './google-signin-form'
import { Button } from '@/components/ui/button'
import { getSetting } from '@/lib/actions/setting.actions'

export const metadata: Metadata = {
  title: 'Sign In',
}

export default async function SignInPage(props: {
  searchParams: Promise<{
    callbackUrl: string
  }>
}) {
  const searchParams = await props.searchParams
  const { site } = await getSetting()

  const { callbackUrl = '/' } = searchParams

  const session = await auth()
  if (session) {
    return redirect(callbackUrl)
  }

  return (
    <div className='w-full space-y-4'>
      <Card className='shadow-md border-border/60'>
        <CardHeader className='space-y-1 pb-4'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            Sign in
          </CardTitle>
          <CardDescription>
            Welcome back — sign in to your {site.name} account
          </CardDescription>
        </CardHeader>
        <CardContent className='space-y-4'>
          <GoogleSignInForm />
          <SeparatorWithOr />
          <CredentialsSignInForm />
        </CardContent>
      </Card>

      <Card className='shadow-sm border-border/60'>
        <CardContent className='py-4 flex flex-col items-center gap-3 sm:flex-row sm:justify-between'>
          <p className='text-sm text-muted-foreground'>
            New to {site.name}?
          </p>
          <Link
            href={`/sign-up?callbackUrl=${encodeURIComponent(callbackUrl)}`}
            className='w-full sm:w-auto'
          >
            <Button className='w-full sm:w-auto' variant='outline'>
              Create an account
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
