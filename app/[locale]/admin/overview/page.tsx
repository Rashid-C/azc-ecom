import { Metadata } from 'next'

import OverviewReport from './overview-report'
import { requireAdmin } from '@/lib/auth-guard'
export const metadata: Metadata = {
  title: 'Admin Dashboard',
}
const DashboardPage = async () => {
  await requireAdmin()

  return <OverviewReport />
}

export default DashboardPage
