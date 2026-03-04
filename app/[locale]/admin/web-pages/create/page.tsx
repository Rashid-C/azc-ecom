import { Metadata } from 'next'
import WebPageForm from '../web-page-form'
import { requireAdmin } from '@/lib/auth-guard'

export const metadata: Metadata = {
  title: 'Create WebPage',
}

export default async function CreateWebPagePage() {
  await requireAdmin()
  return (
    <>
      <h1 className='h1-bold'>Create WebPage</h1>

      <div className='my-8'>
        <WebPageForm type='Create' />
      </div>
    </>
  )
}
