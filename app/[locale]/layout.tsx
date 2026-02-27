import '../globals.css'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { cookies } from 'next/headers'
import React from 'react'
import { getDirection } from '@/i18n-config'
import { getSetting } from '@/lib/actions/setting.actions'
import ClientProviders from '@/components/shared/client-providers'

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
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
