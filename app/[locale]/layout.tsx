import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import React from 'react'
import { getDirection } from '@/i18n-config'
import { getSetting } from '@/lib/actions/setting.actions'
import ClientProviders from '@/components/shared/client-providers'
import { routing } from '@/i18n/routing'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  const setting = await getSetting()
  const messages = await getMessages()
  const cookieStore = await cookies()
  const currency =
    cookieStore.get('currency')?.value || setting.defaultCurrency
  return (
    <html lang={locale} dir={getDirection(locale)} suppressHydrationWarning>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ClientProviders setting={{ ...setting, currency }}>
            {children}
          </ClientProviders>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
