import { auth } from '@/auth'

export async function requireAdmin() {
  const session = await auth()
  if (!session?.user?.role || session.user.role.toLowerCase() !== 'admin') {
    throw new Error('Admin permission required')
  }
  return session
}

