import { getNoCachedSetting } from '@/lib/actions/setting.actions'
import { Metadata } from 'next'
import SettingNav from './setting-nav'
import SettingForm from './setting-form'
import { requireAdmin } from '@/lib/auth-guard'

export const metadata: Metadata = {
  title: 'Settings',
}

const SettingPage = async () => {
  await requireAdmin()
  return (
    <div className='max-w-6xl mx-auto px-2 sm:px-4 w-full'>
      <div className='md:grid md:grid-cols-[200px_1fr] md:gap-6 relative'>
        {/* Sticky sidebar — horizontal scroll on mobile */}
        <aside className='md:sticky md:top-4 md:self-start py-4 md:py-6 overflow-x-auto md:overflow-x-visible'>
          <SettingNav />
        </aside>

        {/* Main content */}
        <main className='py-4 md:py-6 min-w-0'>
          <SettingForm setting={await getNoCachedSetting()} />
        </main>
      </div>
    </div>
  )
}

export default SettingPage
