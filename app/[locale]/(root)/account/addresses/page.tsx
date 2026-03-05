import { Metadata } from 'next'
import { auth } from '@/auth'
import { redirect } from 'next/navigation'
import { getMyAddresses } from '@/lib/actions/order.actions'
import { MapPin, Phone, ChevronRight, Home, ArrowRight, PackageSearch } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Your Addresses',
}

export default async function AddressesPage() {
  const session = await auth()
  if (!session) redirect('/sign-in?callbackUrl=/account/addresses')

  const addresses = await getMyAddresses()

  return (
    <div className='space-y-6'>

      {/* ── Breadcrumb + title ── */}
      <div>
        <nav className='flex items-center gap-1.5 text-xs text-muted-foreground mb-3'>
          <Link href='/account' className='hover:text-foreground transition-colors'>Account</Link>
          <ChevronRight className='h-3 w-3' />
          <span className='text-foreground font-medium'>Addresses</span>
        </nav>

        <div className='flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3'>
          <div>
            <h1 className='text-2xl font-bold tracking-tight'>Saved Addresses</h1>
            <p className='text-sm text-muted-foreground mt-1'>
              Shipping addresses from your order history.
            </p>
          </div>
          {addresses.length > 0 && (
            <span className='inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full self-start sm:self-auto'>
              <MapPin className='h-3 w-3' />
              {addresses.length} address{addresses.length > 1 ? 'es' : ''}
            </span>
          )}
        </div>
      </div>

      {addresses.length === 0 ? (
        /* ── Empty state ── */
        <div className='flex flex-col items-center justify-center py-24 rounded-2xl border-2 border-dashed bg-card/50 text-center px-6'>
          <div className='w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-5'>
            <Home className='h-9 w-9 text-muted-foreground/60' />
          </div>
          <h2 className='text-lg font-semibold'>No addresses saved yet</h2>
          <p className='text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed'>
            Once you place an order, your shipping addresses will automatically appear here.
          </p>
          <Button asChild className='mt-6 gap-2'>
            <Link href='/search'>
              Browse Products
              <ArrowRight className='h-4 w-4' />
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'>
            {addresses.map(({ address, lastUsed, orderId }, index) => (
              <div
                key={orderId}
                className='group relative flex flex-col rounded-2xl border bg-card overflow-hidden hover:shadow-lg hover:border-primary/40 transition-all duration-300'
              >
                {/* Top color strip */}
                <div className={`h-1 w-full ${index === 0 ? 'bg-primary' : 'bg-border'} group-hover:bg-primary transition-colors duration-300`} />

                <div className='flex flex-col flex-1 p-5'>

                  {/* Header row */}
                  <div className='flex items-start justify-between mb-4'>
                    <div className='w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0'>
                      <MapPin className='h-5 w-5 text-primary' />
                    </div>
                    {index === 0 && (
                      <span className='inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-primary text-primary-foreground'>
                        Latest
                      </span>
                    )}
                  </div>

                  {/* Name */}
                  <p className='font-bold text-base leading-tight mb-3'>{address.fullName}</p>

                  {/* Address block */}
                  <div className='flex-1 space-y-1.5 text-sm text-muted-foreground'>
                    <p className='leading-snug'>{address.street}</p>
                    <p>{address.city}, {address.province} {address.postalCode}</p>
                    <p className='font-medium text-foreground/80'>{address.country}</p>
                  </div>

                  {/* Phone */}
                  <div className='flex items-center gap-2 mt-4 pt-4 border-t border-border/60'>
                    <Phone className='h-3.5 w-3.5 text-muted-foreground shrink-0' />
                    <span className='text-sm text-muted-foreground'>{address.phone}</span>
                  </div>

                  {/* Footer */}
                  <div className='flex items-center justify-between mt-4'>
                    <p className='text-xs text-muted-foreground'>
                      {new Date(lastUsed).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                    <Link
                      href={`/account/orders/${orderId}`}
                      className='inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline group/link'
                    >
                      <PackageSearch className='h-3.5 w-3.5' />
                      View Order
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Info note */}
          <div className='flex items-start gap-3 rounded-xl border bg-muted/40 px-4 py-3.5'>
            <MapPin className='h-4 w-4 text-muted-foreground mt-0.5 shrink-0' />
            <p className='text-sm text-muted-foreground leading-relaxed'>
              <span className='font-medium text-foreground'>Want to use a different address?</span>{' '}
              Simply enter a new address during checkout — it will be saved automatically.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
