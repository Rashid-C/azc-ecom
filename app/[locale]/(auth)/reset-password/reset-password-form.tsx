'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { resetPassword } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { CheckCircle } from 'lucide-react'

const schema = z
  .object({
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Password must be at least 8 characters'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

type FormValues = z.infer<typeof schema>

export default function ResetPasswordForm({ token }: { token: string }) {
  const [done, setDone] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const { control, handleSubmit, formState } = form

  const onSubmit = async (data: FormValues) => {
    const res = await resetPassword(token, data.password)
    if (!res.success) {
      toast({
        title: 'Error',
        description: res.error || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className='flex flex-col items-center gap-4 py-6 text-center'>
        <CheckCircle className='h-12 w-12 text-green-500' />
        <p className='font-medium text-foreground'>Password updated!</p>
        <p className='text-sm text-muted-foreground'>
          Your password has been changed successfully.
        </p>
        <Link href='/sign-in'>
          <Button className='mt-2'>Sign in with new password</Button>
        </Link>
      </div>
    )
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className='space-y-4'>
          <FormField
            control={control}
            name='password'
            render={({ field }) => (
              <FormItem>
                <FormLabel>New password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='At least 6 characters'
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name='confirmPassword'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm new password</FormLabel>
                <FormControl>
                  <Input
                    type='password'
                    placeholder='Re-enter your password'
                    autoComplete='new-password'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type='submit'
            className='w-full'
            disabled={formState.isSubmitting}
          >
            {formState.isSubmitting ? 'Updating...' : 'Update password'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
