import { auth } from '@/auth'

import { Button, buttonVariants } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SignOut } from '@/lib/actions/user.actions'
import { cn } from '@/lib/utils'
import { ChevronDownIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import Link from 'next/link'

export default async function UserButton() {
    const t = await getTranslations()
    const session = await auth()
    return (
        <div className='flex gap-2 items-center'>
            <DropdownMenu>
                <DropdownMenuTrigger className='header-button' asChild>
                    <button type='button' className='flex items-center gap-1 text-white min-w-0'>
                        <div className='flex flex-col text-xs text-left min-w-0'>
                            <span className='truncate max-w-30 sm:max-w-45'>
                                {t('Header.Hello')},{' '}
                                {session ? session.user.name : t('Header.sign in')}
                            </span>
                            <span className='font-bold truncate max-w-30 sm:max-w-45'>
                                {t('Header.Account & Orders')}
                            </span>
                        </div>
                        <ChevronDownIcon className='shrink-0 w-4 h-4' />
                    </button>
                </DropdownMenuTrigger>
                {session ? (
                    <DropdownMenuContent className='w-56 bg-gray-900 text-white border-white/10' align='end' forceMount>
                        <DropdownMenuLabel className='font-normal'>
                            <div className='flex flex-col space-y-1'>
                                <p className='text-sm font-medium leading-none text-white'>
                                    {session.user.name}
                                </p>
                                <p className='text-xs leading-none text-gray-400'>
                                    {session.user.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <Link className='w-full' href='/account'>
                                <DropdownMenuItem className='text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer'>{t('Header.Your account')}</DropdownMenuItem>
                            </Link>
                            <Link className='w-full' href='/account/orders'>
                                <DropdownMenuItem className='text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer'>{t('Header.Your orders')}</DropdownMenuItem>
                            </Link>

                            {session.user.role === 'Admin' && (
                                <Link className='w-full' href='/admin/overview'>
                                    <DropdownMenuItem className='text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer'>{t('Header.Admin')}</DropdownMenuItem>
                                </Link>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuItem className='p-0 mb-1 focus:bg-white/10'>
                            <form action={SignOut} className='w-full'>
                                <Button
                                    className='w-full py-4 px-2 h-4 justify-start text-white hover:bg-white/10'
                                    variant='ghost'
                                >
                                    {t('Header.Sign out')}
                                </Button>
                            </form>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                ) : (
                    <DropdownMenuContent className='w-56 bg-gray-900 text-white border-white/10' align='end' forceMount>
                        <DropdownMenuGroup>
                            <DropdownMenuItem className='focus:bg-white/10'>
                                <Link
                                    className={cn(buttonVariants(), 'w-full')}
                                    href='/sign-in'
                                >
                                    {t('Header.Sign in')}
                                </Link>
                            </DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuLabel>
                            <div className='font-normal text-gray-300'>
                                {t('Header.New Customer')}?{' '}
                                <Link href='/sign-up' className='text-white underline'>{t('Header.Sign up')}</Link>
                            </div>
                        </DropdownMenuLabel>
                    </DropdownMenuContent>
                )}
            </DropdownMenu>
        </div>
    )
}
