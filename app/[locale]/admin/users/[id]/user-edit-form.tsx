'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm, Resolver } from 'react-hook-form'
import { useState } from 'react'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { updateUser } from '@/lib/actions/user.actions'
import { USER_ROLES } from '@/lib/constants'
import { IUser } from '@/lib/db/models/user.model'
import { cn } from '@/lib/utils'
import { UserUpdateSchema } from '@/lib/validator'

const UserEditForm = ({ user }: { user: IUser }) => {
  const router = useRouter()
  const [isRoleOpen, setIsRoleOpen] = useState(false)

  type UserUpdateInput = z.infer<typeof UserUpdateSchema>
  const form = useForm<UserUpdateInput>({
    resolver: zodResolver(UserUpdateSchema) as Resolver<UserUpdateInput>,
    defaultValues: { ...user, _id: user._id.toString() },
  })
  const selectedRole = form.watch('role')?.toString()

  const { toast } = useToast()
  async function onSubmit(values: z.infer<typeof UserUpdateSchema>) {
    try {
      const res = await updateUser({
        ...values,
        _id: user._id.toString(),
      })
      if (!res.success)
        return toast({
          variant: 'destructive',
          description: res.message,
        })

      toast({
        description: res.message,
      })
      form.reset()
      router.push(`/admin/users`)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        variant: 'destructive',
        description: error.message,
      })
    }
  }

  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6 w-full max-w-2xl'
      >
        <div className='grid grid-cols-1 md:grid-cols-2 gap-5'>
          <FormField
            control={form.control}
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter user name' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='email'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder='Enter user email' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div
          className={cn(
            'w-full md:max-w-sm transition-[margin] duration-150',
            isRoleOpen && 'mb-24'
          )}
        >
          <FormField
            control={form.control}
            name='role'
            render={({ field }) => (
              <FormItem className='w-full space-y-2'>
                <FormLabel className='flex items-center justify-between'>
                  <span>Role</span>
                  <span
                    className={cn(
                      'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                      selectedRole === 'Admin'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                        : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                    )}
                  >
                    {selectedRole}
                  </span>
                </FormLabel>
                <Select
                  open={isRoleOpen}
                  onOpenChange={setIsRoleOpen}
                  onValueChange={field.onChange}
                  value={field.value.toString()}
                >
                  <FormControl>
                    <SelectTrigger
                      className='w-full bg-background'
                    >
                      <SelectValue placeholder='Select a role' />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent
                    position='popper'
                    align='start'
                    side='bottom'
                    sideOffset={8}
                    className='min-w-[var(--radix-select-trigger-width)]'
                  >
                    {USER_ROLES.map((role) => (
                      <SelectItem
                        key={role}
                        value={role}
                        className='py-2'
                      >
                        <span
                          className={cn(
                            'inline-flex rounded-full px-2 py-0.5 text-xs font-semibold',
                            role === 'Admin'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                          )}
                        >
                          {role}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-start gap-3'>
          <Button
            type='submit'
            disabled={form.formState.isSubmitting}
            className='bg-blue-600 hover:bg-blue-700 text-white w-full sm:w-auto'
          >
            {form.formState.isSubmitting ? 'Submitting...' : `Update User `}
          </Button>
          <Button
            variant='outline'
            type='button'
            className='w-full sm:w-auto'
            onClick={() => router.push(`/admin/users`)}
          >
            Back
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default UserEditForm
