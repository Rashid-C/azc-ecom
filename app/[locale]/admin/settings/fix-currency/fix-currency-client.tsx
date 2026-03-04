'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { fixCurrencyBaseToAED } from '@/lib/actions/setting.actions'

export default function FixCurrencyClient() {
  const [status, setStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFix = async () => {
    setLoading(true)
    const res = await fixCurrencyBaseToAED()
    setLoading(false)
    setStatus(res.message)
    if (res.success) setDone(true)
  }

  if (done) {
    return (
      <div className='rounded-lg border border-green-400 bg-green-50 dark:bg-green-950 p-4 text-green-800 dark:text-green-200 font-medium'>
        {status}
      </div>
    )
  }

  return (
    <div className='space-y-3'>
      {status && (
        <div className='rounded-lg border border-red-400 bg-red-50 dark:bg-red-950 p-3 text-red-700 dark:text-red-300 text-sm'>
          {status}
        </div>
      )}
      <Button
        onClick={handleFix}
        disabled={loading}
      >
        {loading ? 'Applying...' : 'Apply — Set AED as Base Currency'}
      </Button>
    </div>
  )
}
