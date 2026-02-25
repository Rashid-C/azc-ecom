<<<<<<< HEAD
import { notFound } from 'next/navigation'

import { getUserById } from '@/lib/actions/user.actions'

import Link from 'next/link'
import { Metadata } from 'next'
import UserEditForm from './user-edit-form'
=======
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getUserById, updateUser } from '@/lib/actions/user.actions'
>>>>>>> fff4e33bdac36677bb824b10c6a58b32a0f188fe

export const metadata: Metadata = {
  title: 'Edit User',
}

<<<<<<< HEAD
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
    <main className='max-w-6xl mx-auto p-4'>
      <div className='flex mb-4'>
        <Link href='/admin/users'>Users</Link>
        <span className='mx-1'>›</span>
        <Link href={`/admin/users/${user._id}`}>
          Edit User <span className='italic font-bold'>{user.name}</span>
        </Link>
      </div>

      <div className='my-8'>
        <UserEditForm user={user} />
      </div>
    </main>
  )
}
=======
export default async function AdminUserEditPage(props: {
  params: Promise<{ id: string }>
}) {
  const params = await props.params
  const session = await auth()

  if (session?.user.role !== 'Admin')
    throw new Error('Admin permission required')

  const user = await getUserById(params.id)
  if (!user) notFound()

  async function submitAction(formData: FormData) {
    'use server'
    const session = await auth()
    if (session?.user.role !== 'Admin')
      throw new Error('Admin permission required')

    const res = await updateUser({
      _id: params.id,
      name: String(formData.get('name') || ''),
      email: String(formData.get('email') || ''),
      role: String(formData.get('role') || 'User'),
    })

    if (!res.success) throw new Error(res.message)
    redirect('/admin/users')
  }

  return (
    <main className='max-w-2xl mx-auto p-4 space-y-6'>
      <div className='flex mb-4'>
        <Link href='/admin/users'>Users</Link>
        <span className='mx-1'>›</span>
        <span>{user._id.toString()}</span>
      </div>

      <h1 className='h1-bold'>Edit User</h1>

      <form action={submitAction} className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='name'>Name</Label>
          <Input id='name' name='name' defaultValue={user.name} required />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='email'>Email</Label>
          <Input id='email' name='email' type='email' defaultValue={user.email} required />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='role'>Role</Label>
          <select
            id='role'
            name='role'
            defaultValue={user.role}
            className='w-full rounded-md border border-input bg-background px-3 py-2 text-sm'
          >
            <option value='User'>User</option>
            <option value='Admin'>Admin</option>
          </select>
        </div>

        <Button type='submit'>Update User</Button>
      </form>
    </main>
  )
}
>>>>>>> fff4e33bdac36677bb824b10c6a58b32a0f188fe
