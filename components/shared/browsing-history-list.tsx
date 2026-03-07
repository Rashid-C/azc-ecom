'use client'
import useBrowsingHistory from '@/hooks/use-browsing-history'
import React, { useEffect, useState } from 'react'
import ProductSlider from './product/product-slider'
import { Separator } from '../ui/separator'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'
import { History } from 'lucide-react'

export default function BrowsingHistoryList({
  className,
}: {
  className?: string
}) {
  const { products } = useBrowsingHistory()
  const t = useTranslations('Home')
  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  if (!mounted) return null

  if (products.length === 0) {
    return (
      <div className='bg-background'>
        <Separator className={cn('mb-6', className)} />
        <div className='flex flex-col items-center justify-center py-10 text-center gap-3 text-muted-foreground'>
          <History className='w-10 h-10 opacity-30' />
          <p className='text-sm font-medium'>{t('Your browsing history')}</p>
          <p className='text-xs opacity-60'>
            Products you view will appear here.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='bg-background'>
      <Separator className={cn('mb-4', className)} />
      <ProductList
        title={t("Related to items that you've viewed")}
        type='related'
      />
      <Separator className='mb-4' />
      <ProductList
        title={t('Your browsing history')}
        hideDetails
        type='history'
      />
    </div>
  )
}

function ProductList({
  title,
  type = 'history',
  hideDetails = false,
  excludeId = '',
}: {
  title: string
  type: 'history' | 'related'
  excludeId?: string
  hideDetails?: boolean
}) {
  const { products } = useBrowsingHistory()
  const [data, setData] = React.useState([])
  useEffect(() => {
    const fetchProducts = async () => {
      const res = await fetch(
        `/api/products/browsing-history?type=${type}&excludeId=${excludeId}&categories=${products
          .map((product) => product.category)
          .join(',')}&ids=${products.map((product) => product.id).join(',')}`
      )
      const data = await res.json()
      setData(data)
    }
    fetchProducts()
    }, [excludeId, products, type])

  return (
    data.length > 0 && (
      <ProductSlider title={title} products={data} hideDetails={hideDetails} />
    )
  )
}