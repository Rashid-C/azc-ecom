'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useForm, Resolver } from 'react-hook-form'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { createProduct, updateProduct } from '@/lib/actions/product.actions'
import { IProduct } from '@/lib/db/models/product.model'
import { UploadButton } from '@/lib/uploadthing'
import { ProductInputSchema, ProductUpdateSchema } from '@/lib/validator'
import { Checkbox } from '@/components/ui/checkbox'
import { toSlug } from '@/lib/utils'
import { IProductInput } from '@/types'

const productDefaultValues: IProductInput =
  process.env.NODE_ENV === 'development'
    ? {
        name: 'Sample Product',
        slug: 'sample-product',
        category: 'Sample Category',
        images: ['/images/p11-1.jpg'],
        brand: 'Sample Brand',
        description: 'This is a sample description of the product.',
        price: 99.99,
        listPrice: 0,
        countInStock: 15,
        numReviews: 0,
        avgRating: 0,
        numSales: 0,
        isPublished: false,
        tags: [],
        sizes: [],
        colors: [],
        ratingDistribution: [],
        reviews: [],
      }
    : {
        name: '',
        slug: '',
        category: '',
        images: [],
        brand: '',
        description: '',
        price: 0,
        listPrice: 0,
        countInStock: 0,
        numReviews: 0,
        avgRating: 0,
        numSales: 0,
        isPublished: false,
        tags: [],
        sizes: [],
        colors: [],
        ratingDistribution: [],
        reviews: [],
      }

const ProductForm = ({
  type,
  product,
  productId,
  categories = [],
  brands = [],
}: {
  type: 'Create' | 'Update'
  product?: IProduct
  productId?: string
  categories?: string[]
  brands?: string[]
}) => {
  const router = useRouter()
  const [catOpen, setCatOpen] = useState(false)
  const [brandOpen, setBrandOpen] = useState(false)
  const [catOrder, setCatOrder] = useState<string[]>(() => {
    const cur = product?.category
    if (cur) return [cur, ...categories.filter((c) => c !== cur)]
    return categories
  })
  const [brandOrder, setBrandOrder] = useState<string[]>(() => {
    const cur = product?.brand
    if (cur) return [cur, ...brands.filter((b) => b !== cur)]
    return brands
  })

  const form = useForm<IProductInput>({
    resolver: (
      type === 'Update'
        ? zodResolver(ProductUpdateSchema)
        : zodResolver(ProductInputSchema)
    ) as Resolver<IProductInput>,
    defaultValues:
      product && type === 'Update' ? product : productDefaultValues,
  })

  const { toast } = useToast()
  async function onSubmit(values: IProductInput) {
    if (type === 'Create') {
      const res = await createProduct(values)
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        toast({
          description: res.message,
        })
        router.push(`/admin/products`)
      }
    }
    if (type === 'Update') {
      if (!productId) {
        router.push(`/admin/products`)
        return
      }
      const res = await updateProduct({ ...values, _id: productId })
      if (!res.success) {
        toast({
          variant: 'destructive',
          description: res.message,
        })
      } else {
        router.push(`/admin/products`)
      }
    }
  }
  const images = form.watch('images')

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
            name='name'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder='Enter product name' {...field} />
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
                      placeholder='Enter product slug'
                      className='pl-8'
                      {...field}
                    />
                    <button
                      type='button'
                      onClick={() => {
                        form.setValue('slug', toSlug(form.getValues('name')))
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
            name='category'
            render={({ field }) => {
              const filtered = catOrder.filter((c) =>
                c.toLowerCase().includes((field.value ?? '').toLowerCase())
              )
              const isNew =
                field.value.trim() !== '' &&
                !catOrder.some(
                  (c) => c.toLowerCase() === field.value.toLowerCase()
                )
              return (
                <FormItem className='w-full'>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='Select or create category'
                        {...field}
                        autoComplete='off'
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          setCatOpen(true)
                        }}
                        onFocus={() => setCatOpen(true)}
                        onBlur={() =>
                          setTimeout(() => setCatOpen(false), 150)
                        }
                      />
                      {catOpen && (filtered.length > 0 || isNew) && (
                        <div className='absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-auto'>
                          {filtered.map((cat) => (
                            <button
                              key={cat}
                              type='button'
                              onMouseDown={() => {
                                field.onChange(cat)
                                setCatOpen(false)
                                setCatOrder((prev) => [cat, ...prev.filter((c) => c !== cat)])
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                field.value === cat
                                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                                  : ''
                              }`}
                            >
                              {cat}
                            </button>
                          ))}
                          {isNew && (
                            <button
                              type='button'
                              onMouseDown={() => setCatOpen(false)}
                              className='w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 font-medium flex items-center gap-1.5 border-t border-gray-100 dark:border-gray-800'
                            >
                              <span className='text-base leading-none'>+</span>
                              Create &ldquo;{field.value}&rdquo;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />

          <FormField
            control={form.control}
            name='brand'
            render={({ field }) => {
              const filtered = brandOrder.filter((b) =>
                b.toLowerCase().includes((field.value ?? '').toLowerCase())
              )
              const isNew =
                field.value.trim() !== '' &&
                !brandOrder.some(
                  (b) => b.toLowerCase() === field.value.toLowerCase()
                )
              return (
                <FormItem className='w-full'>
                  <FormLabel>Brand</FormLabel>
                  <FormControl>
                    <div className='relative'>
                      <Input
                        placeholder='Select or create brand'
                        {...field}
                        autoComplete='off'
                        onChange={(e) => {
                          field.onChange(e.target.value)
                          setBrandOpen(true)
                        }}
                        onFocus={() => setBrandOpen(true)}
                        onBlur={() =>
                          setTimeout(() => setBrandOpen(false), 150)
                        }
                      />
                      {brandOpen && (filtered.length > 0 || isNew) && (
                        <div className='absolute z-20 w-full mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-auto'>
                          {filtered.map((b) => (
                            <button
                              key={b}
                              type='button'
                              onMouseDown={() => {
                                field.onChange(b)
                                setBrandOpen(false)
                                setBrandOrder((prev) => [b, ...prev.filter((x) => x !== b)])
                              }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ${
                                field.value === b
                                  ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium'
                                  : ''
                              }`}
                            >
                              {b}
                            </button>
                          ))}
                          {isNew && (
                            <button
                              type='button'
                              onMouseDown={() => setBrandOpen(false)}
                              className='w-full text-left px-3 py-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-950 font-medium flex items-center gap-1.5 border-t border-gray-100 dark:border-gray-800'
                            >
                              <span className='text-base leading-none'>+</span>
                              Create &ldquo;{field.value}&rdquo;
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )
            }}
          />
        </div>
        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='listPrice'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>List Price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    step='0.01'
                    placeholder='0.00'
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='price'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Net Price</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    min='0'
                    step='0.01'
                    placeholder='0.00'
                    {...field}
                    onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name='countInStock'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Count In Stock</FormLabel>
                <FormControl>
                  <Input
                    type='number'
                    placeholder='Enter product count in stock'
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className='flex flex-col gap-5 md:flex-row'>
          <FormField
            control={form.control}
            name='images'
            render={() => (
              <FormItem className='w-full'>
                <FormLabel>Images</FormLabel>
                <Card>
                  <CardContent className='space-y-2 mt-2 min-h-48'>
                    <div className='flex flex-wrap justify-start items-center gap-3'>
                      {images.map((image: string, idx: number) => {
                        const colors = [
                          'bg-blue-100 dark:bg-blue-950 ring-blue-400',
                          'bg-emerald-100 dark:bg-emerald-950 ring-emerald-400',
                          'bg-violet-100 dark:bg-violet-950 ring-violet-400',
                          'bg-amber-100 dark:bg-amber-950 ring-amber-400',
                          'bg-rose-100 dark:bg-rose-950 ring-rose-400',
                          'bg-cyan-100 dark:bg-cyan-950 ring-cyan-400',
                        ]
                        const color = colors[idx % colors.length]
                        return (
                        <div key={image} className={`relative p-1.5 rounded-xl ring-2 ${color}`}>
                          <Image
                            src={image}
                            alt='product image'
                            className='w-20 h-20 object-cover object-center rounded-lg'
                            width={100}
                            height={100}
                          />
                          <button
                            type='button'
                            className='absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none shadow'
                            onClick={() =>
                              form.setValue(
                                'images',
                                images.filter((img: string) => img !== image)
                              )
                            }
                          >
                            ✕
                          </button>
                        </div>
                        )
                      })}
                      <FormControl>
                        <UploadButton
                          endpoint='imageUploader'
                          onClientUploadComplete={(res: { url: string }[]) => {
                            form.setValue('images', [...images, res[0].url])
                          }}
                          onUploadError={(error: Error) => {
                            toast({
                              variant: 'destructive',
                              description: `ERROR! ${error.message}`,
                            })
                          }}
                          appearance={{
                            button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-semibold rounded-full px-5 py-2 shadow transition-colors',
                            allowedContent: 'text-amber-600 dark:text-amber-400 font-medium bg-amber-100 dark:bg-amber-950 px-2 py-0.5 rounded-full',
                          }}
                        />
                      </FormControl>
                    </div>
                  </CardContent>
                </Card>

                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div>
          <FormField
            control={form.control}
            name='description'
            render={({ field }) => (
              <FormItem className='w-full'>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder='Tell us a little bit about yourself'
                    className='resize-none'
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  You can <span>@mention</span> other users and organizations to
                  link to them.
                </FormDescription>
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
            className='col-span-2 w-full bg-blue-600 hover:bg-blue-700 text-white'
          >
            {form.formState.isSubmitting ? 'Submitting...' : `${type} Product `}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default ProductForm
