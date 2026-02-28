'use client'

import { ChevronUp, Globe, Github, Linkedin, Mail, Phone } from 'lucide-react'
import { Button } from '../ui/button'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from '@/i18n/routing'
import useSettingStore from '@/hooks/use-setting-store'
import { i18n } from '@/i18n-config'
import { useLocale, useTranslations } from 'use-intl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'

export default function Footer() {
   const router = useRouter()
  const pathname = usePathname()
  const {
    setting: { site, availableCurrencies, currency },
    setCurrency,
  } = useSettingStore()
  const { locales } = i18n

  const locale = useLocale()
  const t = useTranslations()
  return (
    <footer className='bg-black text-white underline-link'>
      <div className='w-full'>
        <Button
          variant='ghost'
          className='bg-gray-800 w-full rounded-none'
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className='mr-2 h-4 w-4' />
           {t('Footer.Back to top')}
        </Button>
         <div className='grid grid-cols-1 md:grid-cols-3 gap-6 p-6 max-w-7xl mx-auto'>
          <div>
            <h3 className='font-bold mb-2'>{t('Footer.Get to Know Us')}</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/page/careers'>{t('Footer.Careers')}</Link>
              </li>
              <li>
                <Link href='/page/blog'>{t('Footer.Blog')}</Link>
              </li>
              <li>
                <Link href='/page/about-us'>
                  {t('Footer.About name', { name: site.name })}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-bold mb-2'>{t('Footer.Make Money with Us')}</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/page/sell'>
                  {t('Footer.Sell products on', { name: site.name })}
                </Link>
              </li>
              <li>
                <Link href='/page/become-affiliate'>
                  {t('Footer.Become an Affiliate')}
                </Link>
              </li>
              <li>
                <Link href='/page/advertise'>
                  {t('Footer.Advertise Your Products')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className='font-bold mb-2'>{t('Footer.Let Us Help You')}</h3>
            <ul className='space-y-2'>
              <li>
                <Link href='/page/shipping'>
                  {t('Footer.Shipping Rates & Policies')}
                </Link>
              </li>
              <li>
                <Link href='/page/returns-policy'>
                  {t('Footer.Returns & Replacements')}
                </Link>
              </li>
              <li>
                <Link href='/page/help'>{t('Footer.Help')}</Link>
              </li>
            </ul>
          </div>
        </div>
        <div className='border-t border-gray-800'>
          <div className='max-w-7xl mx-auto py-4 px-4 flex flex-col items-center space-y-2'>
            <div className='flex items-center space-x-4 flex-wrap md:flex-nowrap'>
              <Image
                src='/icons/logo.svg'
                alt={`${site.name} logo`}
                width={48}
                height={48}
                className='w-14'
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                }}
              />{' '}
              <Select
                value={locale}
                onValueChange={(value) => {
                  router.push(pathname, { locale: value })
                }}
                disabled
              >
                <SelectTrigger className='opacity-70 cursor-not-allowed'>
                  <SelectValue placeholder={t('Footer.Select a language')} />
                </SelectTrigger>
                <SelectContent>
                  {locales.map((lang, index) => (
                    <SelectItem key={index} value={lang.code}>
                      <Link
                        className='w-full flex items-center gap-1'
                        href={pathname}
                        locale={lang.code}
                      >
                        <span className='text-lg'>{lang.icon}</span> {lang.name}
                      </Link>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={currency}
                onValueChange={(value) => {
                  setCurrency(value)
                  window.scrollTo(0, 0)
                }}
                disabled
              >
                <SelectTrigger className='opacity-70 cursor-not-allowed'>
                  <SelectValue placeholder={t('Footer.Select a currency')} />
                </SelectTrigger>
                <SelectContent>
                  {availableCurrencies
                    .filter((x) => x.code)
                    .map((currency, index) => (
                      <SelectItem key={index} value={currency.code}>
                        {currency.name} ({currency.code})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      <div className='px-4 py-2'>
        <div className='flex justify-center gap-3 text-sm'>
          <Link href='/page/conditions-of-use'>
            {t('Footer.Conditions of Use')}
          </Link>
          <Link href='/page/privacy-policy'>{t('Footer.Privacy Notice')}</Link>
          <Link href='/page/help'>{t('Footer.Help')}</Link>
        </div>
        <div className='flex justify-center text-sm'>
         <p> © {site.copyright}</p>
        </div>
        <div className='mt-2 flex justify-center text-sm text-gray-400'>
          {site.address} | {site.phone}
        </div>

        {/* Developer credit */}
        <div className='mt-3 pt-3 border-t border-gray-800 flex flex-col items-center gap-1.5'>
          <p className='text-xs text-gray-500'>
            Designed &amp; Developed by{' '}
            <span className='text-gray-300 font-medium'>Rashid C</span>
          </p>
          <div className='flex items-center gap-3'>
            <Link
              href='https://www.rashidc.site'
              target='_blank'
              rel='noopener noreferrer'
              title='Portfolio'
              className='text-gray-500 hover:text-white transition-colors'
            >
              <Globe className='h-4 w-4' />
            </Link>
            <Link
              href='https://github.com/Rashid-C'
              target='_blank'
              rel='noopener noreferrer'
              title='GitHub'
              className='text-gray-500 hover:text-white transition-colors'
            >
              <Github className='h-4 w-4' />
            </Link>
            <Link
              href='https://www.linkedin.com/in/rashid-c/'
              target='_blank'
              rel='noopener noreferrer'
              title='LinkedIn'
              className='text-gray-500 hover:text-blue-400 transition-colors'
            >
              <Linkedin className='h-4 w-4' />
            </Link>
            <Link
              href='mailto:anurashid105@gmail.com'
              title='Email'
              className='text-gray-500 hover:text-yellow-400 transition-colors'
            >
              <Mail className='h-4 w-4' />
            </Link>
            <Link
              href='tel:+918078967913'
              title='+91 8078967913'
              className='text-gray-500 hover:text-green-400 transition-colors'
            >
              <Phone className='h-4 w-4' />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}