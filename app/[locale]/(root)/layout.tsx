import React from 'react'

import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import WhatsAppButton from '@/components/shared/whatsapp-button'
import AiChatWidget from '@/components/shared/ai-chat-widget'
import { getSetting } from '@/lib/actions/setting.actions'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [setting, session] = await Promise.all([getSetting(), auth()])

  if (
    setting.common.isMaintenanceMode &&
    session?.user?.role?.toLowerCase() !== 'admin'
  ) {
    redirect('/maintenance')
  }

  return (
    <div className='flex flex-col min-h-screen w-full overflow-x-hidden'>
      <Header />
      <main className='flex-1 flex flex-col p-2 sm:p-4 w-full overflow-x-hidden'>{children}</main>
      <Footer />
      <WhatsAppButton phone={setting.site.phone} />
      <AiChatWidget />
    </div>
  )
}
