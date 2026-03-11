'use client'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useCartStore from '@/hooks/use-cart-store'
import useSettingStore from '@/hooks/use-setting-store'
import { useToast } from '@/hooks/use-toast'
import { OrderItem } from '@/types'
import { Mail, MapPin, Phone, Store, Truck, ShoppingCart, Zap } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function AddToCart({
  item,
  minimal = false,
}: {
  item: OrderItem
  minimal?: boolean
}) {
  const router = useRouter()
  const { toast } = useToast()

  const { addItem, setFulfillmentMethod, cart } = useCartStore()
  const {
    setting: { site },
  } = useSettingStore()

  const [quantity, setQuantity] = useState(1)
  const [showFulfillmentDialog, setShowFulfillmentDialog] = useState(false)
  // Always default to store-pickup
  const [selectedMethod, setSelectedMethod] = useState<
    'store-pickup' | 'home-delivery'
  >('store-pickup')

  const t = useTranslations()

  const handleBuyNow = async () => {
    try {
      await addItem(item, quantity)
    } catch (error: any) {
      toast({ variant: 'destructive', description: error.message })
      return
    }
    // Always show the fulfillment dialog — reset to store-pickup each time
    setSelectedMethod('store-pickup')
    setShowFulfillmentDialog(true)
  }

  const handleConfirmFulfillment = async () => {
    if (!selectedMethod) return
    await setFulfillmentMethod(selectedMethod as 'store-pickup' | 'home-delivery')
    setShowFulfillmentDialog(false)
    router.push('/checkout')
  }

  return minimal ? (
    <Button
      size='sm'
      className='rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5'
      onClick={() => {
        try {
          addItem(item, 1)
          toast({
            description: t('Product.Added to Cart'),
            action: (
              <Button
                onClick={() => {
                  router.push('/cart')
                }}
              >
                {t('Product.Go to Cart')}
              </Button>
            ),
          })
        } catch (error: any) {
          toast({
            variant: 'destructive',
            description: error.message,
          })
        }
      }}
    >
      <ShoppingCart className='h-4 w-4' />
      {t('Product.Add to Cart')}
    </Button>
  ) : (
    <>
      <div className='w-full space-y-2'>
        <Select
          value={quantity.toString()}
          onValueChange={(i) => setQuantity(Number(i))}
        >
          <SelectTrigger>
            <SelectValue>
              {t('Product.Quantity')}: {quantity}
            </SelectValue>
          </SelectTrigger>
          <SelectContent position='popper'>
            {Array.from({ length: item.countInStock }).map((_, i) => (
              <SelectItem key={i + 1} value={`${i + 1}`}>
                {i + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          size='lg'
          className='rounded-full w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-2'
          type='button'
          onClick={async () => {
            try {
              const itemId = await addItem(item, quantity)
              router.push(`/cart/${itemId}`)
            } catch (error: any) {
              toast({
                variant: 'destructive',
                description: error.message,
              })
            }
          }}
        >
          <ShoppingCart className='h-5 w-5' />
          {t('Product.Add to Cart')}
        </Button>

        <Button
          size='lg'
          onClick={handleBuyNow}
          className='w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold gap-2'
        >
          <Zap className='h-5 w-5' />
          {t('Product.Buy Now')}
        </Button>
      </div>

      {/* Fulfillment Method Dialog */}
      <Dialog open={showFulfillmentDialog} onOpenChange={setShowFulfillmentDialog}>
        <DialogContent className='sm:max-w-md'>
          <DialogHeader>
            <DialogTitle>Choose Fulfillment Method</DialogTitle>
          </DialogHeader>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(v) =>
              setSelectedMethod(v as 'store-pickup' | 'home-delivery')
            }
            className='space-y-3 mt-2'
            defaultValue='store-pickup'
          >
            {/* Store Pickup */}
            <div
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedMethod === 'store-pickup' ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='store-pickup' id='d-store-pickup' />
                <Label
                  htmlFor='d-store-pickup'
                  className='cursor-pointer flex items-center gap-2 font-semibold'
                >
                  <Store className='h-4 w-4 text-green-600' />
                  Collect from Store
                  <span className='text-xs font-normal text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full'>
                    FREE
                  </span>
                </Label>
              </div>
              {selectedMethod === 'store-pickup' && (
                <div className='mt-3 ml-6 space-y-1.5 text-sm text-muted-foreground'>
                  <div className='flex items-start gap-2'>
                    <MapPin className='h-3.5 w-3.5 shrink-0 mt-0.5 text-primary' />
                    <span>{site.address}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Phone className='h-3.5 w-3.5 shrink-0 text-primary' />
                    <span>{site.phone}</span>
                  </div>
                  <div className='flex items-center gap-2'>
                    <Mail className='h-3.5 w-3.5 shrink-0 text-primary' />
                    <span>{site.email}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Home Delivery */}
            <div
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${selectedMethod === 'home-delivery' ? 'border-primary bg-primary/5' : 'border-border'}`}
            >
              <div className='flex items-center gap-2'>
                <RadioGroupItem value='home-delivery' id='d-home-delivery' />
                <Label
                  htmlFor='d-home-delivery'
                  className='cursor-pointer flex items-center gap-2 font-semibold'
                >
                  <Truck className='h-4 w-4 text-blue-600' />
                  Home Delivery
                </Label>
              </div>
              {selectedMethod === 'home-delivery' && (
                <p className='mt-2 ml-6 text-xs text-blue-700 bg-blue-50 rounded px-2 py-1'>
                  Delivery charge varies by location. An additional fee will be
                  applied based on your address after purchase.
                </p>
              )}
            </div>
          </RadioGroup>

          <Button
            onClick={handleConfirmFulfillment}
            className='w-full rounded-full bg-amber-500 hover:bg-amber-600 text-black font-semibold mt-2'
          >
            Continue to Checkout
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
