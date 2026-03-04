/* eslint-disable react-hooks/exhaustive-deps */
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ISettingInput } from '@/types'
import { Package, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

export default function DeliveryDateForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availableDeliveryDates',
  })
  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form

  const availableDeliveryDates = watch('availableDeliveryDates') ?? []
  const defaultDeliveryDate = watch('defaultDeliveryDate')

  useEffect(() => {
    const validCodes = availableDeliveryDates.map((d) => d.name)
    if (!validCodes.includes(defaultDeliveryDate)) {
      setValue('defaultDeliveryDate', '')
    }
  }, [JSON.stringify(availableDeliveryDates)])

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Package className='h-4 w-4 text-primary' />
          Delivery Dates
        </CardTitle>
        <CardDescription>
          Configure delivery options with days, shipping price, and free shipping thresholds
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>

        {/* Header row */}
        {fields.length > 0 && (
          <div className='hidden md:grid grid-cols-[1fr_80px_100px_100px_40px] gap-3 px-1'>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Name</span>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Days</span>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Ship Price</span>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Free Ship Min</span>
            <span />
          </div>
        )}

        <div className='space-y-3'>
          {fields.map((field, index) => (
            <div key={field.id} className='flex flex-col md:grid md:grid-cols-[1fr_80px_100px_100px_40px] gap-3 items-start p-3 md:p-0 rounded-lg border border-border/50 md:border-0 md:rounded-none bg-muted/20 md:bg-transparent'>
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='md:sr-only'>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g. Standard' />
                    </FormControl>
                    <FormMessage>
                      {errors.availableDeliveryDates?.[index]?.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.daysToDeliver`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='md:sr-only'>Days</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='3' />
                    </FormControl>
                    <FormMessage>
                      {errors.availableDeliveryDates?.[index]?.daysToDeliver?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.shippingPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='md:sr-only'>Ship Price</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='10' />
                    </FormControl>
                    <FormMessage>
                      {errors.availableDeliveryDates?.[index]?.shippingPrice?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availableDeliveryDates.${index}.freeShippingMinPrice`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='md:sr-only'>Free Ship Min</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='100' />
                    </FormControl>
                    <FormMessage>
                      {errors.availableDeliveryDates?.[index]?.freeShippingMinPrice?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                type='button'
                disabled={fields.length === 1}
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive hover:bg-destructive/10 self-end md:self-start md:mt-0.5'
                onClick={() => remove(index)}
              >
                <Trash2 className='h-4 w-4' />
              </Button>
            </div>
          ))}
        </div>

        <Button
          type='button'
          variant='outline'
          size='sm'
          className='gap-2'
          onClick={() =>
            append({
              name: '',
              daysToDeliver: 0,
              shippingPrice: 0,
              freeShippingMinPrice: 0,
            })
          }
        >
          <Plus className='h-4 w-4' />
          Add Delivery Option
        </Button>

        <FormField
          control={control}
          name='defaultDeliveryDate'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Delivery Option</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a delivery option' />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDeliveryDates
                      .filter((x) => x.name)
                      .map((d, index) => (
                        <SelectItem key={index} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultDeliveryDate?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
