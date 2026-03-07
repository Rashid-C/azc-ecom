'use server'

import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { auth, signIn, signOut } from '@/auth'
import { IUserName, IUserSignIn, IUserSignUp } from '@/types'
import { UserSignUpSchema, UserUpdateSchema } from '../validator'
import { connectToDatabase } from '../db'
import User, { IUser } from '../db/models/user.model'
import { formatError } from '../utils'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { getSetting } from './setting.actions'
import { requireAdmin } from '../auth-guard'
import { sendPasswordResetEmail } from '@/emails'

const BCRYPT_SALT_ROUNDS = (() => {
  const fromEnv = Number(process.env.BCRYPT_SALT_ROUNDS)
  if (Number.isFinite(fromEnv) && fromEnv >= 10) return fromEnv
  return 12
})()

const hashResetToken = (token: string) =>
  crypto.createHash('sha256').update(token).digest('hex')

const getTrustedSiteUrl = (fallbackUrl: string) => {
  const configuredUrl =
    process.env.APP_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    fallbackUrl

  const normalized = configuredUrl?.trim()
  if (!normalized) return fallbackUrl

  try {
    return new URL(normalized).toString().replace(/\/$/, '')
  } catch {
    return fallbackUrl
  }
}

// CREATE
export async function registerUser(userSignUp: IUserSignUp) {
  try {
    const user = await UserSignUpSchema.parseAsync({
      name: userSignUp.name,
      email: userSignUp.email,
      password: userSignUp.password,
      confirmPassword: userSignUp.confirmPassword,
    })

    await connectToDatabase()
    await User.create({
      ...user,
      password: await bcrypt.hash(user.password, BCRYPT_SALT_ROUNDS),
      emailVerified: true,
    })
    return { success: true, message: 'User created successfully' }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// DELETE

export async function deleteUser(id: string) {
  try {
    await requireAdmin()
    await connectToDatabase()
    const res = await User.findByIdAndDelete(id)
    if (!res) throw new Error('Use not found')
    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User deleted successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
// UPDATE

export async function updateUser(user: z.infer<typeof UserUpdateSchema>) {
  try {
    await requireAdmin()
    await connectToDatabase()
    const dbUser = await User.findById(user._id)
    if (!dbUser) throw new Error('User not found')
    dbUser.name = user.name
    dbUser.email = user.email
    dbUser.role = user.role
    const updatedUser = await dbUser.save()
    revalidatePath('/admin/users')
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}
export async function updateUserName(user: IUserName) {
  try {
    const session = await auth()
    if (!session) throw new Error('User is not authenticated')
    await connectToDatabase()
    const currentUser = await User.findById(session.user.id)
    if (!currentUser) throw new Error('User not found')
    currentUser.name = user.name
    const updatedUser = await currentUser.save()
    return {
      success: true,
      message: 'User updated successfully',
      data: JSON.parse(JSON.stringify(updatedUser)),
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

export async function signInWithCredentials(user: IUserSignIn) {
  return await signIn('credentials', { ...user, redirect: false })
}
export const SignInWithGoogle = async () => {
  await signIn('google')
}
export const SignOut = async () => {
  const redirectTo = await signOut({ redirect: false })
  redirect(redirectTo.redirect)
}

// GET
export async function getAllUsers({
  limit,
  page,
}: {
  limit?: number
  page: number
}) {
  await requireAdmin()
  const {
    common: { pageSize },
  } = await getSetting()
  limit = limit || pageSize
  await connectToDatabase()

  const skipAmount = (Number(page) - 1) * limit
  const users = await User.find()
    .sort({ createdAt: 'desc' })
    .skip(skipAmount)
    .limit(limit)
  const usersCount = await User.countDocuments()
  return {
    data: JSON.parse(JSON.stringify(users)) as IUser[],
    totalPages: Math.ceil(usersCount / limit),
  }
}

export async function getUserById(userId: string) {
  await requireAdmin()
  await connectToDatabase()
  const user = await User.findById(userId)
  if (!user) throw new Error('User not found')
  return JSON.parse(JSON.stringify(user)) as IUser
}

// CHANGE PASSWORD (logged-in user)
export async function updateUserPassword({
  currentPassword,
  newPassword,
}: {
  currentPassword: string
  newPassword: string
}) {
  try {
    const session = await auth()
    if (!session?.user?.id) return { success: false, message: 'Not authenticated' }

    await connectToDatabase()
    const user = await User.findById(session.user.id)
    if (!user) return { success: false, message: 'User not found' }

    // Google-only accounts have no password
    if (!user.password) {
      return {
        success: false,
        message: 'Your account uses Google sign-in. Password change is not available.',
      }
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password)
    if (!isMatch) {
      return { success: false, message: 'Current password is incorrect.' }
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
    await user.save()

    return { success: true, message: 'Password updated successfully.' }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// REQUEST PASSWORD RESET
export async function requestPasswordReset(email: string) {
  try {
    await connectToDatabase()
    const user = await User.findOne({ email: email.toLowerCase().trim() })

    // Always return success to prevent email enumeration
    if (!user) {
      return { success: true }
    }

    const token = crypto.randomBytes(32).toString('hex')
    const tokenHash = hashResetToken(token)
    const expires = new Date(Date.now() + 1000 * 60 * 60) // 1 hour

    user.resetPasswordToken = tokenHash
    user.resetPasswordExpires = expires
    await user.save()

    const { site } = await getSetting()
    const origin = getTrustedSiteUrl(site.url)

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      token,
      siteUrl: origin,
      siteName: site.name,
    })

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}

// RESET PASSWORD WITH TOKEN
export async function resetPassword(token: string, newPassword: string) {
  try {
    if (!token || !newPassword || newPassword.length < 8) {
      return { success: false, error: 'Invalid request' }
    }

    await connectToDatabase()
    const tokenHash = hashResetToken(token)
    const user = await User.findOne({
      resetPasswordExpires: { $gt: new Date() },
      $or: [
        { resetPasswordToken: tokenHash }, // new secure format
        { resetPasswordToken: token }, // backward compatibility for already-issued links
      ],
    })

    if (!user) {
      return { success: false, error: 'Reset link is invalid or has expired.' }
    }

    user.password = await bcrypt.hash(newPassword, BCRYPT_SALT_ROUNDS)
    user.resetPasswordToken = undefined
    user.resetPasswordExpires = undefined
    await user.save()

    return { success: true }
  } catch (error) {
    return { success: false, error: formatError(error) }
  }
}
