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
    <div className='max-w-6xl mx-auto px-4'>
      <div className='md:grid md:grid-cols-[220px_1fr] md:gap-8 relative'>
        {/* Sticky sidebar */}
        <aside className='md:sticky md:top-4 md:self-start py-6'>
          <SettingNav />
        </aside>

        {/* Main content */}
        <main className='py-6'>
          <SettingForm setting={await getNoCachedSetting()} />
        </main>
      </div>
    </div>
  )
}

export default SettingPage
