import Image from 'next/image'
import Link from 'next/link'
import Search from './search'
import Menu from './menu'
import data from '@/lib/data'
import { getAllCategories } from '@/lib/actions/product.actions'
import Sidebar from './sidebar'
import { getSetting } from '@/lib/actions/setting.actions'
import { getTranslations } from 'next-intl/server'

export default async function Header() {
  const categories = await getAllCategories()
  const { site } = await getSetting()
  const t = await getTranslations()

  return (
    <header className='bg-black text-white sticky top-0 z-50 shadow-lg'>

      {/* ── Row 1: Logo | Categories (centered) | Icons ── */}
      <div className='px-4'>
        <div className='grid grid-cols-[auto_1fr_auto] h-16 items-center gap-4'>

          {/* Logo */}
          <Link
            href='/'
            className='flex items-center gap-2 header-button font-extrabold text-xl shrink-0'
          >
            <Image
              src={site.logo}
              alt={`${site.name} logo`}
              width={40}
              height={40}
            />
            <span className='hidden sm:inline'>{site.name}</span>
          </Link>

          {/* Product categories — centered, desktop only */}
          <nav className='hidden md:flex items-center justify-center gap-0.5 overflow-hidden'>
            {categories.map((cat, i) => (
              <Link
                key={cat}
                href={`/search?category=${cat}`}
                className={`px-3 py-1.5 text-sm font-medium whitespace-nowrap rounded-full transition-colors
                  ${i === 0
                    ? 'text-primary font-semibold underline underline-offset-4'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
              >
                {cat}
              </Link>
            ))}
          </nav>

          {/* Right: language, theme, user, cart */}
          <div className='flex justify-end'>
            <Menu />
          </div>

        </div>

        {/* Mobile search row */}
        <div className='md:hidden pb-2'>
          <Search />
        </div>
      </div>

      {/* ── Row 2: Sidebar | Deal/menu links | Desktop search ── */}
      <div className='bg-gray-900 border-t border-white/10'>
        <div className='px-4 flex items-center gap-2 h-11'>

          <Sidebar categories={categories} />

          <span className='hidden sm:block h-5 w-px bg-white/20 shrink-0' />

          {/* Deal / tag links */}
          <div className='flex flex-1 items-center overflow-hidden'>
            {data.headerMenus.map((menu) => (
              <Link
                href={menu.href}
                key={menu.name}
                className='header-button px-2.5! py-1! text-sm text-gray-300 hover:text-white whitespace-nowrap'
              >
                {t('Header.' + menu.name)}
              </Link>
            ))}
          </div>

          {/* Desktop search pinned right */}
          <div className='hidden md:block shrink-0'>
            <Search />
          </div>

        </div>
      </div>

    </header>
  )
}
