'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { Menu, X } from 'lucide-react'

const links = [
  { title: 'Overview', href: '/admin/overview' },
  { title: 'Products', href: '/admin/products' },
  { title: 'Orders', href: '/admin/orders' },
  { title: 'Users', href: '/admin/users' },
  { title: 'Pages', href: '/admin/web-pages' },
  { title: 'Settings', href: '/admin/settings' },
]

export function AdminNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname()
  const t = useTranslations('Admin')
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  return (
    <div className={cn('relative flex items-center', className)} {...props}>
      {/* Desktop nav links */}
      <nav className='hidden md:flex items-center gap-4 lg:gap-6'>
        {links.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'text-sm font-medium transition-colors hover:text-white whitespace-nowrap',
              pathname.includes(item.href)
                ? 'text-white'
                : 'text-gray-400'
            )}
          >
            {t(item.title)}
          </Link>
        ))}
      </nav>

      {/* Mobile hamburger button */}
      <button
        className='md:hidden flex items-center justify-center w-9 h-9 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors'
        onClick={() => setOpen((v) => !v)}
        aria-label='Toggle menu'
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Mobile dropdown */}
      {open && (
        <div className='md:hidden absolute top-full left-0 mt-2 w-48 bg-gray-900 border border-white/10 rounded-xl shadow-xl z-50 overflow-hidden'>
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center px-4 py-3 text-sm font-medium transition-colors hover:bg-white/10',
                pathname.includes(item.href)
                  ? 'text-white bg-white/5 border-l-2 border-white'
                  : 'text-gray-300'
              )}
            >
              {t(item.title)}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
