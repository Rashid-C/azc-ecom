import Header from '@/components/shared/header'
import Footer from '@/components/shared/footer'
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
    <div className='flex flex-col min-h-screen'>
      <Header />
      <main className='flex-1 flex flex-col'>{children}</main>
      <Footer />
    </div>
  )
}
