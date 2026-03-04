/* eslint-disable @next/next/no-img-element */
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { UploadButton } from '@/lib/uploadthing'
import { ISettingInput } from '@/types'
import { Camera, ImageIcon, Trash2 } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

export default function SiteInfoForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { watch, control } = form
  const siteLogo = watch('site.logo')

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <ImageIcon className='h-4 w-4 text-primary' />
          Site Info
        </CardTitle>
        <CardDescription>
          Configure your site&apos;s name, logo, and contact details
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>

        {/* Logo + Name row */}
        <div className='flex flex-col sm:flex-row gap-6 items-start'>
          {/* Clickable logo upload */}
          <div className='flex flex-col items-center gap-2 shrink-0'>
            <span className='text-sm font-medium text-muted-foreground'>Logo</span>
            <div className='relative group cursor-pointer'>
              {/* Visual area */}
              <div className='w-24 h-24 rounded-2xl border-2 border-dashed border-primary/40 bg-muted/30 flex items-center justify-center overflow-hidden transition-colors group-hover:border-primary group-hover:bg-muted/50'>
                {siteLogo ? (
                  <img
                    src={siteLogo}
                    alt='site logo'
                    className='object-contain w-full h-full p-2'
                  />
                ) : (
                  <div className='flex flex-col items-center gap-1.5 text-muted-foreground'>
                    <Camera className='h-7 w-7' />
                    <span className='text-[10px] font-medium uppercase tracking-wide'>
                      Upload
                    </span>
                  </div>
                )}
              </div>

              {/* Hover overlay when logo exists */}
              {siteLogo && (
                <div className='absolute inset-0 rounded-2xl bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none'>
                  <Camera className='h-6 w-6 text-white' />
                </div>
              )}

              {/* Invisible UploadButton covering the whole area */}
              <div className='absolute inset-0'>
                <UploadButton
                  endpoint='imageUploader'
                  onClientUploadComplete={(res) => {
                    form.setValue('site.logo', res[0].url)
                    toast({ description: 'Logo uploaded successfully' })
                  }}
                  onUploadError={(error: Error) => {
                    toast({
                      variant: 'destructive',
                      description: `Upload failed: ${error.message}`,
                    })
                  }}
                  appearance={{
                    button:
                      'absolute inset-0 w-24 h-24 opacity-0 cursor-pointer m-0 p-0 rounded-2xl',
                    allowedContent: 'hidden',
                    container: 'absolute inset-0 w-24 h-24',
                  }}
                />
              </div>
            </div>

            {siteLogo && (
              <Button
                type='button'
                variant='ghost'
                size='sm'
                className='gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs h-7 px-2'
                onClick={() => form.setValue('site.logo', '')}
              >
                <Trash2 className='h-3 w-3' />
                Remove
              </Button>
            )}
            <p className='text-[10px] text-muted-foreground/70 text-center'>
              {siteLogo ? 'Click to change' : 'Click to upload'}
            </p>
          </div>

          {/* Name + URL */}
          <div className='flex flex-col gap-4 flex-1 w-full'>
            <FormField
              control={control}
              name='site.name'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site Name</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter site name' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='site.url'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Site URL</FormLabel>
                  <FormControl>
                    <Input placeholder='https://example.com' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Description + Slogan */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={control}
            name='site.description'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Enter site description'
                    className='min-h-24 resize-none'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className='space-y-4'>
            <FormField
              control={control}
              name='site.slogan'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slogan</FormLabel>
                  <FormControl>
                    <Input placeholder='Enter site slogan' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='site.keywords'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Keywords</FormLabel>
                  <FormControl>
                    <Input placeholder='keyword1, keyword2' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Contact */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <FormField
            control={control}
            name='site.phone'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl>
                  <Input placeholder='+971 xx xxx xxxx' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='site.email'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type='email'
                    placeholder='contact@example.com'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='site.address'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Address</FormLabel>
                <FormControl>
                  <Input placeholder='Enter physical address' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name='site.copyright'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Copyright</FormLabel>
                <FormControl>
                  <Input
                    placeholder='© 2025 Your Company'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </CardContent>
    </Card>
  )
}
