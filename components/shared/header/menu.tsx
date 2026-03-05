import { auth } from '@/auth'
import { getTranslations } from 'next-intl/server'
import CartButton from './cart-button'
import UserButton from './user-button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { SignOut } from '@/lib/actions/user.actions'
import {
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu as MenuIcon,
  Package,
  ShoppingBag,
  User,
} from 'lucide-react'
import Link from 'next/link'

const Menu = async ({ forAdmin = false }: { forAdmin?: boolean }) => {
  const [t, session] = await Promise.all([getTranslations(), auth()])

  const initial = session?.user?.name?.[0]?.toUpperCase() ?? '?'

  return (
    <div className='flex justify-end'>
      {/* Desktop */}
      <nav className='md:flex gap-3 hidden w-full'>
        <UserButton />
        {forAdmin ? null : <CartButton />}
      </nav>

      {/* Mobile */}
      <nav className='md:hidden'>
        <Sheet>
          <SheetTrigger asChild>
            <button
              type='button'
              aria-label='Open menu'
              className='flex items-center justify-center w-9 h-9 rounded-full text-white hover:bg-white/15 transition-colors'
            >
              <MenuIcon className='h-5 w-5' />
            </button>
          </SheetTrigger>

          <SheetContent
            side='right'
            className='w-72 p-0 flex flex-col bg-background'
          >
            <SheetTitle className='sr-only'>Site Menu</SheetTitle>
            <SheetDescription className='sr-only'>
              Navigation menu
            </SheetDescription>

            {session ? (
              <>
                {/* User header */}
                <div className='bg-linear-to-br from-primary/15 via-primary/8 to-transparent px-5 pt-8 pb-5'>
                  <div className='flex items-center gap-3'>
                    <div className='w-12 h-12 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0 shadow-sm'>
                      {initial}
                    </div>
                    <div className='min-w-0'>
                      <p className='font-semibold text-sm truncate leading-tight'>
                        {session.user.name}
                      </p>
                      <p className='text-xs text-muted-foreground truncate mt-0.5'>
                        {session.user.email}
                      </p>
                      {session.user.role === 'Admin' && (
                        <span className='inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/20 text-primary mt-1'>
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Nav links */}
                <div className='flex-1 px-3 py-3 space-y-0.5 overflow-y-auto'>
                  <Link
                    href='/account'
                    className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors group'
                  >
                    <User className='h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors' />
                    {t('Header.Your account')}
                  </Link>

                  <Link
                    href='/account/orders'
                    className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors group'
                  >
                    <Package className='h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors' />
                    {t('Header.Your orders')}
                  </Link>

                  {!forAdmin && (
                    <Link
                      href='/cart'
                      className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors group'
                    >
                      <ShoppingBag className='h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors' />
                      {t('Header.Cart')}
                    </Link>
                  )}

                  {session.user.role === 'Admin' && (
                    <>
                      <Separator className='my-2' />
                      <Link
                        href='/admin/overview'
                        className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-primary/10 hover:text-primary transition-colors group'
                      >
                        <LayoutDashboard className='h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors' />
                        {t('Header.Admin')}
                      </Link>
                    </>
                  )}
                </div>

                <Separator />

                {/* Sign out */}
                <div className='px-3 py-3'>
                  <form action={SignOut}>
                    <Button
                      type='submit'
                      variant='ghost'
                      className='w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10 font-medium'
                    >
                      <LogOut className='h-4 w-4 shrink-0' />
                      {t('Header.Sign out')}
                    </Button>
                  </form>
                </div>
              </>
            ) : (
              <>
                {/* Not logged in header */}
                <div className='bg-linear-to-br from-primary/15 via-primary/8 to-transparent px-5 pt-8 pb-5'>
                  <div className='w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3'>
                    <User className='h-5 w-5 text-muted-foreground' />
                  </div>
                  <p className='text-sm font-medium'>Welcome!</p>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    Sign in to access your account
                  </p>
                </div>

                <Separator />

                <div className='px-4 py-4 space-y-2'>
                  <Link href='/sign-in' className='block'>
                    <Button className='w-full gap-2 font-medium'>
                      <LogIn className='h-4 w-4' />
                      {t('Header.Sign in')}
                    </Button>
                  </Link>
                  <Link href='/sign-up' className='block'>
                    <Button variant='outline' className='w-full font-medium'>
                      {t('Header.Sign up')}
                    </Button>
                  </Link>
                </div>

                {!forAdmin && (
                  <>
                    <Separator />
                    <div className='px-3 py-2'>
                      <Link
                        href='/cart'
                        className='flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium hover:bg-muted transition-colors group'
                      >
                        <ShoppingBag className='h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0 transition-colors' />
                        {t('Header.Cart')}
                      </Link>
                    </div>
                  </>
                )}
              </>
            )}
          </SheetContent>
        </Sheet>
      </nav>
    </div>
  )
}

export default Menu
