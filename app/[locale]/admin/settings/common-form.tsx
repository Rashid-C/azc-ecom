import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
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
import { Separator } from '@/components/ui/separator'
import { COLORS, THEMES } from '@/lib/constants'
import { ISettingInput } from '@/types'
import { Palette, SettingsIcon, ShieldAlert, Truck } from 'lucide-react'
import { UseFormReturn } from 'react-hook-form'

export default function CommonForm({
  form,
  id,
}: {
  form: UseFormReturn<ISettingInput>
  id: string
}) {
  const { control } = form

  return (
    <Card id={id}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <SettingsIcon className='h-4 w-4 text-primary' />
          Common Settings
        </CardTitle>
        <CardDescription>
          Configure pagination, shipping, appearance defaults, and maintenance mode
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>

        {/* Pagination + Shipping */}
        <div>
          <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5'>
            <Truck className='h-3.5 w-3.5' />
            Storefront
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <FormField
              control={control}
              name='common.pageSize'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Page Size</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. 12' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='common.freeShippingMinPrice'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Free Shipping Min Price</FormLabel>
                  <FormControl>
                    <Input placeholder='e.g. 100' {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Appearance */}
        <div>
          <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5'>
            <Palette className='h-3.5 w-3.5' />
            Appearance Defaults
          </p>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
            <FormField
              control={control}
              name='common.defaultColor'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Color</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a color' />
                      </SelectTrigger>
                      <SelectContent>
                        {COLORS.map((color, index) => (
                          <SelectItem key={index} value={color}>
                            {color}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name='common.defaultTheme'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Theme</FormLabel>
                  <FormControl>
                    <Select
                      value={field.value || ''}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select a theme' />
                      </SelectTrigger>
                      <SelectContent>
                        {THEMES.map((theme, index) => (
                          <SelectItem key={index} value={theme}>
                            {theme}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Separator />

        {/* Maintenance */}
        <div>
          <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5'>
            <ShieldAlert className='h-3.5 w-3.5' />
            Maintenance
          </p>
          <FormField
            control={control}
            name='common.isMaintenanceMode'
            render={({ field }) => (
              <FormItem className='flex items-center gap-3 space-y-0 rounded-lg border border-border/60 bg-muted/20 px-4 py-3'>
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div>
                  <FormLabel className='text-sm font-medium cursor-pointer'>
                    Enable Maintenance Mode
                  </FormLabel>
                  <p className='text-xs text-muted-foreground mt-0.5'>
                    When enabled, visitors will see a maintenance page
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

      </CardContent>
    </Card>
  )
}
