'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState } from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  Package,
  Tag,
  ShoppingCart,
  Users,
  Globe,
  Settings,
  Menu as MenuIcon,
  LogOut,
  ShieldCheck,
  ChevronRight,
  Store,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { SignOut } from '@/lib/actions/user.actions'

const links = [
  { title: 'Overview',    href: '/admin/overview',           icon: LayoutDashboard },
  { title: 'Products',    href: '/admin/products',           icon: Package },
  { title: 'Categories',  href: '/admin/products/categories', icon: Tag },
  { title: 'Orders',      href: '/admin/orders',             icon: ShoppingCart },
  { title: 'Users',       href: '/admin/users',              icon: Users },
  { title: 'Pages',       href: '/admin/web-pages',          icon: Globe },
  { title: 'Settings',    href: '/admin/settings',           icon: Settings },
]

/** Returns the single most-specific link that matches the current path */
function getActiveHref(pathname: string) {
  const matches = links.filter((l) => pathname.startsWith(l.href))
  if (!matches.length) return ''
  return matches.reduce((a, b) => (a.href.length >= b.href.length ? a : b)).href
}

interface AdminNavProps extends React.HTMLAttributes<HTMLElement> {
  userName?: string
  userEmail?: string
  userInitial?: string
  siteName?: string
}

export function AdminNav({
  className,
  userName = '',
  userEmail = '',
  userInitial = 'A',
  siteName = 'Admin',
  ...props
}: AdminNavProps) {
  const pathname = usePathname()
  const t = useTranslations('Admin')
  const [open, setOpen] = useState(false)
  const activeHref = getActiveHref(pathname)

  return (
    <div className={cn('flex items-center', className)} {...props}>

      {/* ── Desktop nav ── */}
      <nav className='hidden md:flex items-center gap-1'>
        {links.map((item) => {
          const Icon = item.icon
          const isActive = activeHref === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap',
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/8'
              )}
            >
              <Icon className={cn('h-3.5 w-3.5 shrink-0', isActive ? 'text-white' : 'text-slate-500')} />
              {t(item.title)}
            </Link>
          )
        })}
      </nav>

      {/* ── Mobile hamburger ── */}
      <button
        className='md:hidden flex items-center justify-center w-9 h-9 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors'
        onClick={() => setOpen(true)}
        aria-label='Open admin menu'
      >
        <MenuIcon size={20} />
      </button>

      {/* ── Mobile Sheet drawer ── */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side='left' className='w-72 p-0 flex flex-col bg-slate-950 border-r border-white/10'>
          <SheetTitle className='sr-only'>Admin Navigation</SheetTitle>
          <SheetDescription className='sr-only'>Admin panel navigation menu</SheetDescription>

          {/* Header */}
          <div className='bg-linear-to-br from-primary/20 via-primary/8 to-transparent px-5 pt-7 pb-5'>
            <div className='flex items-center gap-1.5 mb-5'>
              <div className='w-6 h-6 rounded-md bg-primary/30 flex items-center justify-center'>
                <ShieldCheck className='h-3.5 w-3.5 text-primary' />
              </div>
              <span className='text-xs font-bold uppercase tracking-widest text-primary'>{siteName} Admin</span>
            </div>
            {/* User info */}
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-base shrink-0 shadow-lg'>
                {userInitial}
              </div>
              <div className='min-w-0'>
                <p className='text-white font-semibold text-sm truncate leading-tight'>{userName}</p>
                <p className='text-slate-400 text-xs truncate mt-0.5'>{userEmail}</p>
                <span className='inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-primary/25 text-primary mt-1'>
                  <ShieldCheck className='h-2.5 w-2.5' />
                  Admin
                </span>
              </div>
            </div>
          </div>

          <Separator className='bg-white/10' />

          {/* Nav links */}
          <nav className='flex-1 px-3 py-3 space-y-0.5 overflow-y-auto'>
            {links.map((item) => {
              const Icon = item.icon
              const isActive = activeHref === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                    isActive
                      ? 'bg-primary/15 text-primary border border-primary/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/8'
                  )}
                >
                  <div className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                    isActive ? 'bg-primary/20' : 'bg-white/5 group-hover:bg-white/10'
                  )}>
                    <Icon className={cn('h-3.5 w-3.5', isActive ? 'text-primary' : 'text-slate-400 group-hover:text-white')} />
                  </div>
                  <span className='flex-1'>{t(item.title)}</span>
                  {isActive && <ChevronRight className='h-3.5 w-3.5 text-primary/60' />}
                </Link>
              )
            })}
          </nav>

          <Separator className='bg-white/10' />

          {/* Home store link */}
          <div className='px-3 pt-3'>
            <Link
              href='/'
              onClick={() => setOpen(false)}
              className='flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-white/8 transition-all duration-150 group'
            >
              <div className='w-7 h-7 rounded-lg bg-white/5 group-hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors'>
                <Store className='h-3.5 w-3.5 text-slate-400 group-hover:text-white' />
              </div>
              View Store
            </Link>
          </div>

          {/* Sign out */}
          <div className='px-3 py-3'>
            <form action={SignOut}>
              <Button
                type='submit'
                variant='ghost'
                className='w-full justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 font-medium rounded-xl'
              >
                <div className='w-7 h-7 rounded-lg bg-red-500/10 flex items-center justify-center shrink-0'>
                  <LogOut className='h-3.5 w-3.5' />
                </div>
                Sign out
              </Button>
            </form>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
