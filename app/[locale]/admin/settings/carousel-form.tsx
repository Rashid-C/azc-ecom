'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/hooks/use-toast'
import { useUploadThing } from '@/lib/uploadthing'
import { ISettingInput } from '@/types'
import { TrashIcon, UploadIcon } from 'lucide-react'
import Image from 'next/image'
import { useRef, useState } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

function CarouselImageUploader({
  index,
  form,
}: {
  index: number
  form: UseFormReturn<ISettingInput>
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const { watch, setValue } = form

  const { startUpload } = useUploadThing('imageUploader', {
    onClientUploadComplete: (res) => {
      setValue(`carousels.${index}.image`, res[0].ufsUrl)
      toast({ description: 'Image uploaded successfully' })
      setUploading(false)
    },
    onUploadError: (error) => {
      toast({ variant: 'destructive', description: `Upload failed: ${error.message}` })
      setUploading(false)
    },
  })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    await startUpload([file])
    // reset input so the same file can be re-selected
    e.target.value = ''
  }

  const imageUrl = watch(`carousels.${index}.image`)

  return (
    <div className='space-y-2'>
      {imageUrl && imageUrl.startsWith('http') && (
        <div className='relative group w-48'>
          <Image
            src={imageUrl}
            alt='carousel image'
            className='w-full object-cover object-center rounded-sm'
            width={192}
            height={68}
          />
          <button
            type='button'
            onClick={() => setValue(`carousels.${index}.image`, '')}
            className='absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity'
            title='Remove image'
          >
            ×
          </button>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type='file'
        accept='image/*'
        className='hidden'
        onChange={handleFileChange}
      />

      {/* Clickable upload button */}
      <Button
        type='button'
        variant='outline'
        size='sm'
        disabled={uploading}
        onClick={() => inputRef.current?.click()}
        className='flex items-center gap-2'
      >
        <UploadIcon className='w-4 h-4' />
        {uploading ? 'Uploading...' : imageUrl ? 'Change Image' : 'Upload Image'}
      </Button>
    </div>
  )
}

export default function CarouselForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'carousels',
  })
  const {
    formState: { errors },
  } = form

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle>Carousels</CardTitle>
      </CardHeader>
      <CardContent className='space-y-4'>
        <div className='space-y-4'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex justify-between gap-1 w-full'>
              <FormField
                control={form.control}
                name={`carousels.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>Title</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder='Title' />
                    </FormControl>
                    <FormMessage>
                      {errors.carousels?.[index]?.title?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`carousels.${index}.url`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>Url</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder='Url' />
                    </FormControl>
                    <FormMessage>
                      {errors.carousels?.[index]?.url?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`carousels.${index}.buttonCaption`}
                render={({ field }) => (
                  <FormItem>
                    {index == 0 && <FormLabel>Caption</FormLabel>}
                    <FormControl>
                      <Input {...field} placeholder='buttonCaption' />
                    </FormControl>
                    <FormMessage>
                      {errors.carousels?.[index]?.buttonCaption?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <div>
                <FormField
                  control={form.control}
                  name={`carousels.${index}.image`}
                  render={({ field }) => (
                    <FormItem>
                      {index == 0 && <FormLabel>Image</FormLabel>}
                      <FormControl>
                        <Input placeholder='Or paste image url' {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CarouselImageUploader index={index} form={form} />
              </div>
              <div>
                {index == 0 && <div>Action</div>}
                <Button
                  type='button'
                  disabled={fields.length === 1}
                  variant='outline'
                  className={index == 0 ? 'mt-2' : ''}
                  onClick={() => remove(index)}
                >
                  <TrashIcon className='w-4 h-4' />
                </Button>
              </div>
            </div>
          ))}

          <Button
            type='button'
            variant={'outline'}
            onClick={() =>
              append({ url: '', title: '', image: '', buttonCaption: '' })
            }
          >
            Add Carousel
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
