import { useReadLocalStorage } from 'usehooks-ts'

export const keys = ['bookmark_spacing'] as const
export const settingsKey = 'settings'

export type SettingKey = (typeof keys)[number]
export type SettingValue = number
export type Settings = Partial<Record<SettingKey, SettingValue>>

export const defaultSettings: Required<Settings> = { bookmark_spacing: 0 }

export const useSettings = () => useReadLocalStorage<Settings>(settingsKey)

//NEXT usefull settings-code
