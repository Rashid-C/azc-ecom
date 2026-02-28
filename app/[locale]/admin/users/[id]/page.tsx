import { notFound } from 'next/navigation'

import { getUserById } from '@/lib/actions/user.actions'

import UserEditForm from './user-edit-form'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Edit User',
}

export default async function UserEditPage(props: {
  params: Promise<{
    id: string
  }>
}) {
  const params = await props.params

  const { id } = params

  const user = await getUserById(id)
  if (!user) notFound()
  return (
    <main className='max-w-3xl mx-auto p-4 sm:p-6'>
      <div className='flex flex-wrap items-center mb-4 text-sm sm:text-base'>
        <Link href='/admin/users'>Users</Link>
        <span className='mx-1'>&gt;</span>
        <Link href={`/admin/users/${user._id}`}>{user._id.toString()}</Link>
      </div>

      <div className='my-6 sm:my-8'>
        <UserEditForm user={user} />
      </div>
    </main>
  )
}
