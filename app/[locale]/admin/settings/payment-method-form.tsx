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
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { useEffect } from 'react'
import { useFieldArray, UseFormReturn } from 'react-hook-form'

export default function PaymentMethodForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'availablePaymentMethods',
  })
  const {
    setValue,
    watch,
    control,
    formState: { errors },
  } = form

  const availablePaymentMethods = watch('availablePaymentMethods') ?? []
  const defaultPaymentMethod = watch('defaultPaymentMethod')

  useEffect(() => {
    const validCodes = availablePaymentMethods.map((m) => m.name)
    if (!validCodes.includes(defaultPaymentMethod)) {
      setValue('defaultPaymentMethod', '')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(availablePaymentMethods)])

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <CreditCard className='h-4 w-4 text-primary' />
          Payment Methods
        </CardTitle>
        <CardDescription>
          Add available payment methods and set the default
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>

        {/* Header row */}
        {fields.length > 0 && (
          <div className='hidden sm:grid grid-cols-[1fr_120px_40px] gap-3 px-1'>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Name</span>
            <span className='text-xs font-medium text-muted-foreground uppercase tracking-wider'>Commission %</span>
            <span />
          </div>
        )}

        <div className='space-y-3'>
          {fields.map((field, index) => (
            <div key={field.id} className='grid grid-cols-[1fr_120px_40px] gap-3 items-start'>
              <FormField
                control={form.control}
                name={`availablePaymentMethods.${index}.name`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='sr-only'>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='e.g. Stripe, PayPal' />
                    </FormControl>
                    <FormMessage>
                      {errors.availablePaymentMethods?.[index]?.name?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`availablePaymentMethods.${index}.commission`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className='sr-only'>Commission</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder='0' />
                    </FormControl>
                    <FormMessage>
                      {errors.availablePaymentMethods?.[index]?.commission?.message}
                    </FormMessage>
                  </FormItem>
                )}
              />
              <Button
                type='button'
                disabled={fields.length === 1}
                variant='ghost'
                size='icon'
                className='text-destructive hover:text-destructive hover:bg-destructive/10 mt-0.5'
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
          onClick={() => append({ name: '', commission: 0 })}
        >
          <Plus className='h-4 w-4' />
          Add Payment Method
        </Button>

        <FormField
          control={control}
          name='defaultPaymentMethod'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Default Payment Method</FormLabel>
              <FormControl>
                <Select
                  value={field.value || ''}
                  onValueChange={(value) => field.onChange(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder='Select a payment method' />
                  </SelectTrigger>
                  <SelectContent>
                    {availablePaymentMethods
                      .filter((x) => x.name)
                      .map((m, index) => (
                        <SelectItem key={index} value={m.name}>
                          {m.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage>{errors.defaultPaymentMethod?.message}</FormMessage>
            </FormItem>
          )}
        />
      </CardContent>
    </Card>
  )
}
