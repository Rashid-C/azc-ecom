'use client'
import {
  CreditCard,
  ImageIcon,
  Info,
  Languages,
  Package,
  SettingsIcon,
} from 'lucide-react'

import { useEffect, useState } from 'react'

const navItems = [
  { name: 'Site Info', hash: 'setting-site-info', icon: Info },
  { name: 'Common Settings', hash: 'setting-common', icon: SettingsIcon },
  { name: 'Carousels', hash: 'setting-carousels', icon: ImageIcon },
  { name: 'Languages', hash: 'setting-languages', icon: Languages },
  { name: 'Payment Methods', hash: 'setting-payment-methods', icon: CreditCard },
  { name: 'Delivery Dates', hash: 'setting-delivery-dates', icon: Package },
]

const SettingNav = () => {
  const [active, setActive] = useState('')

  useEffect(() => {
    const sections = document.querySelectorAll('div[id^="setting-"]')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        })
      },
      { threshold: 0.3, rootMargin: '0px 0px -40% 0px' }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  const handleScroll = (id: string) => {
    const section = document.getElementById(id)
    if (section) {
      const top = section.offsetTop - 16
      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  return (
    <div>
      <h1 className='h1-bold'>Settings</h1>
      <nav className='flex md:flex-col gap-1 md:fixed mt-4 flex-wrap'>
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = active === item.hash
          return (
            <button
              key={item.hash}
              onClick={() => handleScroll(item.hash)}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left w-full ${
                isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary pl-2.5'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/60 border-l-2 border-transparent pl-2.5'
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : ''}`} />
              <span className='hidden md:inline'>{item.name}</span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}

export default SettingNav
