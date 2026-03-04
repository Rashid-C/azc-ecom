import { getNoCachedSetting } from '@/lib/actions/setting.actions'
import FixCurrencyClient from './fix-currency-client'
import { Metadata } from 'next'
import { requireAdmin } from '@/lib/auth-guard'

export const metadata: Metadata = { title: 'Fix Currency Base' }

export default async function FixCurrencyPage() {
  await requireAdmin()
  const setting = await getNoCachedSetting()
  const aed = setting.availableCurrencies.find((c) => c.code === 'AED')
  const aedRate = aed?.convertRate ?? 1

  const preview = setting.availableCurrencies.map((c) => ({
    name: c.name,
    code: c.code,
    symbol: c.symbol,
    currentRate: c.convertRate,
    newRate: Math.round((c.convertRate / aedRate) * 10000) / 10000,
  }))

  const alreadyFixed = aedRate === 1

  return (
    <div className='max-w-xl mx-auto space-y-6 py-8'>
      <h1 className='text-2xl font-bold'>Fix Currency — Set AED as Base</h1>

      {alreadyFixed ? (
        <div className='rounded-lg border border-green-400 bg-green-50 dark:bg-green-950 p-4 text-green-800 dark:text-green-200'>
          AED is already your base currency (convertRate = 1). No action needed.
        </div>
      ) : (
        <>
          <div className='rounded-lg border border-amber-400 bg-amber-50 dark:bg-amber-950 p-4 text-amber-900 dark:text-amber-200 text-sm'>
            This will change the convert rates so AED = 1 (base). All other
            currencies will be adjusted proportionally. Your product prices in
            the database are NOT changed — only how they are converted for
            display.
          </div>

          <table className='w-full text-sm border rounded-lg overflow-hidden'>
            <thead className='bg-muted'>
              <tr>
                <th className='text-left px-4 py-2'>Currency</th>
                <th className='text-right px-4 py-2'>Current Rate</th>
                <th className='text-right px-4 py-2'>New Rate</th>
              </tr>
            </thead>
            <tbody>
              {preview.map((c) => (
                <tr key={c.code} className='border-t'>
                  <td className='px-4 py-2'>
                    {c.symbol} {c.code} — {c.name}
                  </td>
                  <td className='text-right px-4 py-2'>{c.currentRate}</td>
                  <td
                    className={`text-right px-4 py-2 font-semibold ${
                      c.currentRate !== c.newRate
                        ? 'text-blue-600 dark:text-blue-400'
                        : ''
                    }`}
                  >
                    {c.newRate}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <FixCurrencyClient />
        </>
      )}
    </div>
  )
}
