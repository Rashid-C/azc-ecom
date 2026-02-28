import Link from 'next/link'
import { X, ChevronRight, UserCircle, MenuIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignOut } from '@/lib/actions/user.actions'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import { auth } from '@/auth'
import { getLocale, getTranslations } from 'next-intl/server'
import { getDirection } from '@/i18n-config'

export default async function Sidebar({
  categories,
}: {
  categories: string[]
}) {
  const session = await auth()

  const locale = await getLocale()

  const t = await getTranslations()

  return (
    <Drawer direction={getDirection(locale) === 'rtl' ? 'right' : 'left'}>
      <DrawerTrigger asChild>
        <button
          type='button'
          className='flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gray-700 text-white text-sm font-semibold hover:bg-gray-500 transition-colors shrink-0 border border-white/25'
        >
          <MenuIcon className='h-4 w-4' />
          {t('Header.All')}
        </button>
      </DrawerTrigger>
      <DrawerContent className='w-[350px] mt-0 top-0 bg-gray-900 text-white border-r border-white/10'>
        <div className='flex flex-col h-full'>
          {/* User Sign In Section */}
          <div className='bg-gray-800 flex items-center justify-between border-b border-white/10'>
            <DrawerHeader>
              <DrawerTitle className='flex items-center text-white'>
                <UserCircle className='h-6 w-6 mr-2 text-gray-300' />
                {session ? (
                  <DrawerClose asChild>
                    <Link href='/account'>
                      <span className='text-lg font-semibold text-white hover:text-gray-300 transition-colors'>
                        {t('Header.Hello')}, {session.user.name}
                      </span>
                    </Link>
                  </DrawerClose>
                ) : (
                  <DrawerClose asChild>
                    <Link href='/sign-in'>
                      <span className='text-lg font-semibold text-white hover:text-gray-300 transition-colors'>
                        {t('Header.Hello')}, {t('Header.sign in')}
                      </span>
                    </Link>
                  </DrawerClose>
                )}
              </DrawerTitle>
              <DrawerDescription></DrawerDescription>
            </DrawerHeader>
            <DrawerClose asChild>
              <Button variant='ghost' size='icon' className='mr-2 text-white hover:bg-white/10 hover:text-white'>
                <X className='h-5 w-5' />
                <span className='sr-only'>Close</span>
              </Button>
            </DrawerClose>
          </div>

          {/* Shop By Category */}
          <div className='flex-1 overflow-y-auto'>
            <div className='p-4 border-b border-white/10'>
              <h2 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
                {t('Header.Shop By Department')}
              </h2>
            </div>
            <nav className='flex flex-col'>
              {categories.map((category) => (
                <DrawerClose asChild key={category}>
                  <Link
                    href={`/search?category=${category}`}
                    className='flex items-center justify-between px-4 py-3 text-white hover:bg-white/10 transition-colors border-b border-white/5'
                  >
                    <span>{category}</span>
                    <ChevronRight className='h-4 w-4 text-gray-400' />
                  </Link>
                </DrawerClose>
              ))}
            </nav>
          </div>

          {/* Help & Settings */}
          <div className='border-t border-white/10 flex flex-col'>
            <div className='p-4'>
              <h2 className='text-sm font-semibold text-gray-400 uppercase tracking-wider'>
                {t('Header.Help & Settings')}
              </h2>
            </div>
            <DrawerClose asChild>
              <Link href='/account' className='px-4 py-3 text-white hover:bg-white/10 transition-colors'>
                {t('Header.Your account')}
              </Link>
            </DrawerClose>
            <DrawerClose asChild>
              <Link href='/page/customer-service' className='px-4 py-3 text-white hover:bg-white/10 transition-colors'>
                {t('Header.Customer Service')}
              </Link>
            </DrawerClose>
            {session ? (
              <form action={SignOut} className='w-full'>
                <Button
                  className='w-full justify-start px-4 py-3 text-white hover:bg-white/10 hover:text-white text-base h-auto'
                  variant='ghost'
                >
                  {t('Header.Sign out')}
                </Button>
              </form>
            ) : (
              <Link href='/sign-in' className='px-4 py-3 text-white hover:bg-white/10 transition-colors'>
                {t('Header.Sign in')}
              </Link>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}