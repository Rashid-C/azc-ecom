import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
import WhatsAppButton from '@/components/shared/whatsapp-button'
import { getSetting } from '@/lib/actions/setting.actions'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'

export default async function HomeLayout({
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
      <main className='flex-1 flex flex-col w-full overflow-x-hidden'>{children}</main>
      <Footer />
      <WhatsAppButton phone={setting.site.phone} />
    </div>
  )
}
