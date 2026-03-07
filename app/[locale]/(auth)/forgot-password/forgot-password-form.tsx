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
import { requestPasswordReset } from '@/lib/actions/user.actions'
import { toast } from '@/hooks/use-toast'
import { CheckCircle } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

type FormValues = z.infer<typeof schema>

export default function ForgotPasswordForm() {
  const [submitted, setSubmitted] = useState(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '' },
  })

  const { control, handleSubmit, formState } = form

  const onSubmit = async (data: FormValues) => {
    const res = await requestPasswordReset(data.email)
    if (!res.success) {
      toast({
        title: 'Error',
        description: res.error || 'Something went wrong. Please try again.',
        variant: 'destructive',
      })
      return
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className='flex flex-col items-center gap-4 py-6 text-center'>
        <CheckCircle className='h-12 w-12 text-green-500' />
        <p className='font-medium text-foreground'>Check your email</p>
        <p className='text-sm text-muted-foreground leading-relaxed max-w-xs'>
          If an account exists for that email address, we&apos;ve sent a
          password reset link. It expires in 1 hour.
        </p>
        <Link
          href='/sign-in'
          className='text-sm font-medium underline-offset-4 hover:underline text-muted-foreground'
        >
          Back to sign in
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
            name='email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='you@example.com'
                    autoComplete='email'
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
            {formState.isSubmitting ? 'Sending...' : 'Send reset link'}
          </Button>

          <p className='text-sm text-center text-muted-foreground'>
            <Link
              href='/sign-in'
              className='font-medium text-foreground underline-offset-4 hover:underline'
            >
              Back to sign in
            </Link>
          </p>
        </div>
      </form>
    </Form>
  )
}
