'use server'
import { ISettingInput } from '@/types'
import data from '../data'
import Setting from '../db/models/setting.model'
import { connectToDatabase } from '../db'
import { formatError } from '../utils'
import { requireAdmin } from '../auth-guard'

const globalForSettings = global as unknown as {
  cachedSettings: ISettingInput | null
}
export const getNoCachedSetting = async (): Promise<ISettingInput> => {
  await requireAdmin()
  await connectToDatabase()
  // Use getSetting so the auto-migration runs if needed
  globalForSettings.cachedSettings = null
  return getSetting()
}

export const getSetting = async (): Promise<ISettingInput> => {
  if (!globalForSettings.cachedSettings) {
    await connectToDatabase()
    const setting = await Setting.findOne().lean()
    const parsed: ISettingInput = setting
      ? JSON.parse(JSON.stringify(setting))
      : data.settings[0]

    // Auto-migrate: keep only AED, remove all other currencies, set as base
    const hasOnlyAED =
      parsed.availableCurrencies?.length === 1 &&
      parsed.availableCurrencies[0].code === 'AED' &&
      parsed.availableCurrencies[0].convertRate === 1

    if (!hasOnlyAED) {
      parsed.availableCurrencies = [
        { name: 'UAE Dirham', code: 'AED', symbol: 'AED', convertRate: 1 },
      ]
      parsed.defaultCurrency = 'AED'
      await Setting.findOneAndUpdate(
        {},
        {
          $set: {
            availableCurrencies: parsed.availableCurrencies,
            defaultCurrency: 'AED',
          },
        }
      )
    }

    globalForSettings.cachedSettings = parsed
  }
  return globalForSettings.cachedSettings as ISettingInput
}

export const updateSetting = async (newSetting: ISettingInput) => {
  try {
    await requireAdmin()
    await connectToDatabase()
    const aedCurrency =
      newSetting.availableCurrencies.find((c) => c.code === 'AED') || {
        name: 'UAE Dirham',
        code: 'AED',
        symbol: 'AED',
        convertRate: 1,
      }
    const normalizedSetting = {
      ...newSetting,
      availableCurrencies: [{ ...aedCurrency, convertRate: 1 }],
      defaultCurrency: 'AED',
    }
    const updatedSetting = await Setting.findOneAndUpdate({}, normalizedSetting, {
      upsert: true,
      new: true,
    }).lean()
    globalForSettings.cachedSettings = JSON.parse(
      JSON.stringify(updatedSetting)
    ) // Update the cache
    return {
      success: true,
      message: 'Setting updated successfully',
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

// Normalize all currency convert rates so AED = 1 (base currency)
export const fixCurrencyBaseToAED = async () => {
  try {
    await requireAdmin()
    await connectToDatabase()
    const setting = await Setting.findOne().lean()
    if (!setting) return { success: false, message: 'No settings found in database' }

    const currencies = (setting as ISettingInput).availableCurrencies
    const aed = currencies.find((c) => c.code === 'AED')
    if (!aed) return { success: false, message: 'AED not found in currency list' }

    if (aed.convertRate === 1) {
      return { success: true, message: 'AED is already the base currency — no changes needed.' }
    }

    const aedRate = aed.convertRate
    const updatedCurrencies = currencies.map((c) => ({
      ...c,
      convertRate: Math.round((c.convertRate / aedRate) * 10000) / 10000,
    }))

    await Setting.findOneAndUpdate(
      {},
      { $set: { availableCurrencies: updatedCurrencies, defaultCurrency: 'AED' } },
      { new: true }
    )
    globalForSettings.cachedSettings = null // clear cache so next request re-reads DB

    return {
      success: true,
      message: 'Done — AED is now the base currency. All prices will display correctly.',
      updatedCurrencies,
    }
  } catch (error) {
    return { success: false, message: formatError(error) }
  }
}

