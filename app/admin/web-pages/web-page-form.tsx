'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'

import { z } from 'zod'

import ReactMarkdown from 'react-markdown'
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
import { useToast } from '@/hooks/use-toast'
import { createWebPage, updateWebPage } from '@/lib/actions/web-page.actions'
import { IWebPage } from '@/lib/db/models/web-page.model'
import { WebPageInputSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'

const webPageDefaultValues =
  process.env.NODE_ENV === 'development'
    ? {
        title: 'Sample Page',
        slug: 'sample-page',
        content: 'Sample Content',
      }
    : {
        title: '',
        slug: '',
        content: '',
      }

const WebPageForm = ({
  type,
  webPage,
  webPageId,
}: {
  type: 'Create' | 'Update'
  webPage?: IWebPage
  webPageId?: string
}) => {
  const router = useRouter()
  type FormValues = z.infer<typeof WebPageInputSchema>
  const defaultValues: FormValues =
    webPage && type === 'Update'
      ? {
          title: webPage.title,
          slug: webPage.slug,
          content: webPage.content,
          isPublished: webPage.isPublished,
        }
      : {
          ...webPageDefaultValues,
          isPublished: false,
        }

  const form = useForm<FormValues>({
    resolver: zodResolver(WebPageInputSchema),
    defaultValues,
  })

  const { toast } = useToast()
  async function onSubmit(values: FormValues) {
    if (type === 'Create') {
      const res = await createWebPage(values)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push(`/admin/web-pages`)
      }
    }
    if (type === 'Update') {
      if (!webPageId) {
        router.push(`/admin/web-pages`)
        return
      }
      const res = await updateWebPage({ ...values, _id: webPageId })
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        router.push(`/admin/web-pages`)
      }
    }
  }

  return (
    <Form {...form}>
      <form
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-8'
      >
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='title'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input placeholder='Enter title' {...field} />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='slug'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Slug</FormLabel>

                <FormControl>
                  <div className='relative'>
                    <Input
                      placeholder='Enter slug'
                      className='pl-8'
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        form.setValue('slug', toSlug(form.getValues('title')))
                      }}
                      className='absolute right-2 top-2.5'
                    >
                      Generate
                    </button>
                  </div>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='content'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Content</FormLabel>
                <FormControl>
                  <div className='grid gap-4 md:grid-cols-2'>
                    <Textarea
                      {...field}
                      rows={20}
                      placeholder='Write markdown content'
                    />
                    <div className='rounded-md border p-4 min-h-[500px] overflow-auto'>
                      <ReactMarkdown>{field.value || ''}</ReactMarkdown>
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div>
          <FormField
            control={form.control}
            name='isPublished'
            render={({ field }) => (
              <FormItem className='space-x-2 items-center'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <FormLabel>Is Published?</FormLabel>
              </FormItem>
            )}
          />
        </div>
        <div>
          <Button
            type='submit'
            size='lg'
            disabled={form.formState.isSubmitting}
            className='button col-span-2 w-full'
          >
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Page `}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default WebPageForm
