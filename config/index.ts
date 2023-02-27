export { default as serverConfig } from './server'
export { default as settingsConfig } from './settings'
export { default as themeConfig } from './theme'

export function getValue(label: string, defaultValue: string): string {
  if (!label.startsWith('NEXT_PUBLIC_')) return defaultValue

  try {
    return process.env[label] ?? localStorage[label] ?? defaultValue
  } catch (e) {
    return defaultValue
  }
}
