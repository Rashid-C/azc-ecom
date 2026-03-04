import data from '@/lib/data'
import { ClientSetting, SiteCurrency } from '@/types'
import { create } from 'zustand'

interface SettingState {
  setting: ClientSetting
  setSetting: (newSetting: ClientSetting) => void
  getCurrency: () => SiteCurrency
  setCurrency: (currency: string) => void
}

const useSettingStore = create<SettingState>((set, get) => ({
  setting: {
    ...data.settings[0],
    currency: data.settings[0].defaultCurrency,
  } as ClientSetting,
  setSetting: (newSetting: ClientSetting) => {
    const aedCurrency =
      newSetting.availableCurrencies.find((c) => c.code === 'AED') || {
        name: 'UAE Dirham',
        code: 'AED',
        symbol: 'AED',
        convertRate: 1,
      }
    set({
      setting: {
        ...newSetting,
        availableCurrencies: [aedCurrency],
        defaultCurrency: 'AED',
        currency: 'AED',
      },
    })
  },
  getCurrency: () => {
    return (
      get().setting.availableCurrencies.find((c) => c.code === 'AED') || {
        name: 'UAE Dirham',
        code: 'AED',
        symbol: 'AED',
        convertRate: 1,
      }
    )
  },
  setCurrency: async () => {
    set({ setting: { ...get().setting, currency: 'AED' } })
  },
}))

export default useSettingStore
