import { getSetting } from '@/lib/actions/setting.actions'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Wrench, LogIn, LogOut } from 'lucide-react'

export default async function MaintenancePage() {
  const [setting, session] = await Promise.all([getSetting(), auth()])

  // If maintenance is off → go back to home
  if (!setting.common.isMaintenanceMode) redirect('/')

  // If already logged in as admin → go to home (admin can access everything)
  if (session?.user?.role?.toLowerCase() === 'admin') redirect('/')

  const isLoggedInNonAdmin = !!session?.user

  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center'>
      <div className='max-w-md space-y-6'>
        <div className='flex justify-center'>
          <div className='rounded-full bg-primary/10 p-5'>
            <Wrench className='h-12 w-12 text-primary' />
          </div>
        </div>

        <h1 className='text-3xl font-bold tracking-tight'>
          We&apos;ll be back soon
        </h1>

        <p className='text-muted-foreground text-base leading-relaxed'>
          {setting.site.name} is currently undergoing scheduled maintenance.
          We&apos;re working hard to improve the experience for you. Please
          check back shortly.
        </p>

        {setting.site.email && (
          <p className='text-sm text-muted-foreground'>
            Need help?{' '}
            <a
              href={`mailto:${setting.site.email}`}
              className='underline underline-offset-4 hover:text-foreground transition-colors'
            >
              {setting.site.email}
            </a>
          </p>
        )}

        {isLoggedInNonAdmin ? (
          <div className='space-y-3'>
            <p className='text-sm text-muted-foreground'>
              Signed in as{' '}
              <span className='font-medium text-foreground'>
                {session?.user?.email}
              </span>{' '}
              — no admin access
            </p>
            <Link
              href='/api/auth/signout'
              className='inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors'
            >
              <LogOut className='h-4 w-4' />
              Sign out to switch account
            </Link>
          </div>
        ) : (
          <Link
            href='/sign-in?callbackUrl=%2F'
            className='inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors'
          >
            <LogIn className='h-4 w-4' />
            Admin Login
          </Link>
        )}
      </div>
    </div>
  )
}
