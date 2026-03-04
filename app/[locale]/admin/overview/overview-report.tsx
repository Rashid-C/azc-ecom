'use client'
import {
  BadgeDollarSign,
  Barcode,
  CreditCard,
  Users,
  ArrowRight,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

import Link from 'next/link'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { calculatePastDate, formatDateTime, formatNumber } from '@/lib/utils'

import SalesCategoryPieChart from './sales-category-pie-chart'

import { useEffect, useState, useTransition } from 'react'
import { DateRange } from 'react-day-picker'
import { getOrderSummary } from '@/lib/actions/order.actions'
import SalesAreaChart from './sales-area-chart'
import { CalendarDateRangePicker } from './date-range-picker'
import { IOrderList } from '@/types'
import ProductPrice from '@/components/shared/product/product-price'
import { Skeleton } from '@/components/ui/skeleton'
import TableChart from './table-chart'

const statCards = [
  {
    key: 'revenue',
    titleKey: 'Total Revenue',
    linkHref: '/admin/orders',
    linkKey: 'View revenue',
    icon: BadgeDollarSign,
    iconBg: 'bg-amber-100 dark:bg-amber-900/30',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    key: 'sales',
    titleKey: 'Sales',
    linkHref: '/admin/orders',
    linkKey: 'View orders',
    icon: CreditCard,
    iconBg: 'bg-blue-100 dark:bg-blue-900/30',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    key: 'customers',
    titleKey: 'Customers',
    linkHref: '/admin/users',
    linkKey: 'View customers',
    icon: Users,
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/30',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    key: 'products',
    titleKey: 'Products',
    linkHref: '/admin/products',
    linkKey: 'View products',
    icon: Barcode,
    iconBg: 'bg-purple-100 dark:bg-purple-900/30',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
]

export default function OverviewReport() {
  const t = useTranslations('Admin')
  const [date, setDate] = useState<DateRange | undefined>({
    from: calculatePastDate(30),
    to: new Date(),
  })

  const [data, setData] = useState<{ [key: string]: any }>()

  const [, startTransition] = useTransition()
  useEffect(() => {
    if (date) {
      startTransition(async () => {
        setData(await getOrderSummary(date))
      })
    }
  }, [date])

  if (!data)
    return (
      <div className='space-y-6'>
        <div className='flex items-center justify-between'>
          <h1 className='h1-bold'>Dashboard</h1>
        </div>
        <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className='h-36 w-full rounded-xl' />
          ))}
        </div>
        <Skeleton className='h-120 w-full rounded-xl' />
        <div className='grid gap-4 md:grid-cols-2'>
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className='h-60 w-full rounded-xl' />
          ))}
        </div>
        <div className='grid gap-4 md:grid-cols-2'>
          {[...Array(2)].map((_, i) => (
            <Skeleton key={i} className='h-60 w-full rounded-xl' />
          ))}
        </div>
      </div>
    )

  const statValues: Record<string, string | number | JSX.Element> = {
    revenue: <ProductPrice price={data.totalSales} plain />,
    sales: formatNumber(data.ordersCount),
    customers: data.usersCount,
    products: data.productsCount,
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between flex-wrap gap-3'>
        <h1 className='h1-bold'>{t('Dashboard')}</h1>
        <CalendarDateRangePicker defaultDate={date} setDate={setDate} />
      </div>

      {/* Stat cards */}
      <div className='grid gap-4 grid-cols-2 lg:grid-cols-4'>
        {statCards.map(({ key, titleKey, linkHref, linkKey, icon: Icon, iconBg, iconColor }) => (
          <Card key={key} className='hover:shadow-md transition-shadow'>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium text-muted-foreground'>
                {t(titleKey as any)}
              </CardTitle>
              <div className={`p-2 rounded-lg ${iconBg}`}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
              </div>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='text-2xl font-bold'>{statValues[key]}</div>
              <Link
                href={linkHref}
                className='text-xs text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group'
              >
                {t(linkKey as any)}
                <ArrowRight className='h-3 w-3 group-hover:translate-x-0.5 transition-transform' />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales overview chart */}
      <Card>
        <CardHeader>
          <CardTitle>{t('Sales Overview')}</CardTitle>
          <CardDescription>
            {date?.from && date?.to
              ? `${formatDateTime(date.from).dateOnly} — ${formatDateTime(date.to).dateOnly}`
              : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SalesAreaChart data={data.salesChartData} />
        </CardContent>
      </Card>

      {/* Monthly & product performance */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{t('How much you\u2019re earning')}</CardTitle>
            <CardDescription>
              {t('Estimated')} · {t('Last 6 months')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableChart data={data.monthlySales} labelType='month' />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('Product Performance')}</CardTitle>
            <CardDescription>
              {formatDateTime(date!.from!).dateOnly} —{' '}
              {formatDateTime(date!.to!).dateOnly}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TableChart data={data.topSalesProducts} labelType='product' />
          </CardContent>
        </Card>
      </div>

      {/* Categories & recent sales */}
      <div className='grid gap-4 md:grid-cols-2'>
        <Card>
          <CardHeader>
            <CardTitle>{t('Best-Selling Categories')}</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesCategoryPieChart data={data.topSalesCategories} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>{t('Recent Sales')}</CardTitle>
            <CardDescription>Latest orders across the store</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('Buyer')}</TableHead>
                  <TableHead>{t('Date')}</TableHead>
                  <TableHead>{t('Total')}</TableHead>
                  <TableHead>{t('Actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.latestOrders.map((order: IOrderList) => (
                  <TableRow key={order._id}>
                    <TableCell className='font-medium'>
                      {order.user ? order.user.name : t('Deleted User')}
                    </TableCell>
                    <TableCell className='text-muted-foreground text-sm'>
                      {formatDateTime(order.createdAt).dateOnly}
                    </TableCell>
                    <TableCell>
                      <ProductPrice price={order.totalPrice} plain />
                    </TableCell>
                    <TableCell>
                      <Link href={`/admin/orders/${order._id}`}>
                        <Badge
                          variant='outline'
                          className='cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors'
                        >
                          {t('Details')}
                        </Badge>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
