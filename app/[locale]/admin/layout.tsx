import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import Menu from '@/components/shared/header/menu'
import { AdminNav } from './admin-nav'
import { getSetting } from '@/lib/actions/setting.actions'
import { requireAdmin } from '@/lib/auth-guard'
import { auth } from '@/auth'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  const [{ site }, session] = await Promise.all([getSetting(), auth()])

  const userName = session?.user?.name ?? ''
  const userEmail = session?.user?.email ?? ''
  const userInitial = userName?.[0]?.toUpperCase() ?? 'A'

  return (
    <div className='flex flex-col min-h-screen'>
      {/* ── Top header ── */}
      <header className='sticky top-0 z-40 bg-linear-to-r from-slate-900 via-slate-900 to-slate-800 border-b border-white/10 shadow-xl'>
        <div className='flex h-16 items-center px-4 gap-3'>
          {/* Logo */}
          <Link
            href='/admin/overview'
            className='flex items-center gap-2.5 shrink-0 hover:opacity-90 transition-opacity'
          >
            <Image
              src={site.logo || '/icons/logo.svg'}
              width={34}
              height={34}
              alt={`${site.name} logo`}
              className='rounded-lg'
            />
            <div className='hidden sm:flex flex-col leading-none'>
              <span className='text-white font-bold text-sm tracking-tight'>{site.name}</span>
              <span className='text-slate-400 text-[10px] font-medium uppercase tracking-widest'>Admin</span>
            </div>
          </Link>

          {/* Vertical divider */}
          <div className='hidden sm:block w-px h-7 bg-white/10 mx-1' />

          {/* Nav links (desktop) + single mobile trigger */}
          <AdminNav
            className='flex-1'
            userName={userName}
            userEmail={userEmail}
            userInitial={userInitial}
            siteName={site.name}
          />

          {/* Desktop: user button only (no duplicate on mobile) */}
          <div className='hidden md:flex items-center ml-auto'>
            <Menu forAdmin />
          </div>
        </div>
      </header>

      <div className='flex-1 p-2 sm:p-4 min-w-0 overflow-x-hidden'>
        {children}
      </div>
    </div>
  )
}
