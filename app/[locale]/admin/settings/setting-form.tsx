'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, Resolver } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { SettingInputSchema } from '@/lib/validator'
import { ClientSetting, ISettingInput } from '@/types'
import { updateSetting } from '@/lib/actions/setting.actions'
import useSetting from '@/hooks/use-setting-store'
import PaymentMethodForm from './payment-method-form'
import DeliveryDateForm from './delivery-date-form'
import CommonForm from './common-form'
import CarouselForm from './carousel-form'
import LanguageForm from './app/[locale]/admin/settings/language-form'
import SiteInfoForm from './site-info-form'

const SettingForm = ({ setting }: { setting: ISettingInput }) => {
  const { setSetting } = useSetting()

  const form = useForm<ISettingInput>({
    resolver: zodResolver(SettingInputSchema) as Resolver<ISettingInput>,
    defaultValues: {
      ...setting,
      site: {
        name: setting?.site?.name ?? '',
        url: setting?.site?.url ?? '',
        logo: setting?.site?.logo ?? '',
        slogan: setting?.site?.slogan ?? '',
        description: setting?.site?.description ?? '',
        keywords: setting?.site?.keywords ?? '',
        email: setting?.site?.email ?? '',
        phone: setting?.site?.phone ?? '',
        author: setting?.site?.author ?? '',
        copyright: setting?.site?.copyright ?? '',
        address: setting?.site?.address ?? '',
      },
      defaultLanguage: setting?.defaultLanguage ?? '',
      defaultCurrency: 'AED',
      defaultPaymentMethod: setting?.defaultPaymentMethod ?? '',
      defaultDeliveryDate: setting?.defaultDeliveryDate ?? '',
      availableLanguages: setting?.availableLanguages ?? [],
      availableCurrencies: [{ name: 'UAE Dirham', code: 'AED', symbol: 'AED', convertRate: 1 }],
      availablePaymentMethods: setting?.availablePaymentMethods ?? [],
      availableDeliveryDates: setting?.availableDeliveryDates ?? [],
    },
  })
  const {
    formState: { isSubmitting },
  } = form

  const { toast } = useToast()
  async function onSubmit(values: ISettingInput) {
    const res = await updateSetting({
      ...values,
      defaultCurrency: 'AED',
      availableCurrencies: [
        { name: 'UAE Dirham', code: 'AED', symbol: 'AED', convertRate: 1 },
      ],
    })
    if (!res.success) {
      toast({
        variant: 'destructive',
        description: res.message,
      })
    } else {
      toast({
        description: res.message,
      })
      setSetting(values as ClientSetting)
    }
  }

  return (
    <Form {...form}>
      <form
        className='space-y-4'
        method='post'
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <SiteInfoForm id='setting-site-info' form={form} />
        <CommonForm id='setting-common' form={form} />
        <CarouselForm id='setting-carousels' form={form} />

        <LanguageForm id='setting-languages' form={form} />

        <PaymentMethodForm id='setting-payment-methods' form={form} />

        <DeliveryDateForm id='setting-delivery-dates' form={form} />

        <div>
          <Button
            type='submit'
            size='lg'
            disabled={isSubmitting}
            className='w-full mb-24'
          >
            {isSubmitting ? 'Submitting...' : `Save Setting`}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default SettingForm
