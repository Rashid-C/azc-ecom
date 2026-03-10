import { getSetting } from '@/lib/actions/setting.actions'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { site } = await getSetting()
  return (
    <div className='flex flex-col min-h-screen bg-linear-to-b from-background via-background to-muted/40 highlight-link'>
      <header className='flex justify-center pt-10 pb-6'>
        <Link href='/' className='flex flex-col items-center gap-2 group'>
          <div className='rounded-2xl p-2 transition-transform group-hover:scale-105'>
            <Image
              src={site.logo || '/icons/logo.svg'}
              alt={`${site.name} logo`}
              width={56}
              height={56}
              priority
              style={{ maxWidth: '100%', height: 'auto' }}
            />
          </div>
        </Link>
      </header>

      <main className='flex-1 flex items-start justify-center px-4 pb-10'>
        <div className='w-full max-w-sm'>{children}</div>
      </main>

      <footer className='w-full px-4 pb-10'>
        <div className='flex flex-col items-center gap-3'>
          <div className='w-16 h-px bg-border/60' />
          <div className='flex flex-wrap justify-center items-center gap-1'>
            {[
              { href: '/page/conditions-of-use', label: 'Conditions of Use' },
              { href: '/page/privacy-policy', label: 'Privacy Notice' },
              { href: '/page/help', label: 'Help' },
            ].map((link, i, arr) => (
              <span key={link.href} className='flex items-center gap-1'>
                <Link
                  href={link.href}
                  className='text-xs text-muted-foreground/80 hover:text-primary transition-colors duration-200 px-2 py-1 rounded hover:bg-primary/5'
                >
                  {link.label}
                </Link>
                {i < arr.length - 1 && (
                  <span className='text-border text-xs select-none'>·</span>
                )}
              </span>
            ))}
          </div>
          <p className='text-[11px] text-muted-foreground/50 tracking-wide'>
            {site.copyright}
          </p>
        </div>
      </footer>
    </div>
  )
}
