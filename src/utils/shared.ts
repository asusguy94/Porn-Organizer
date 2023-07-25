import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export const getUnique = <T>(arr: T[], prop?: keyof T): T[] => {
  if (prop !== undefined) {
    return arr.filter((obj, idx) => arr.findIndex(item => item[prop] === obj[prop]) === idx)
  }

  return [...new Set(arr)]
}

// eslint-disable-next-line @typescript-eslint/unified-signatures
export function clamp(value: number, min: number, max: number): number
export function clamp(value: number, max: number): number
export function clamp(value: number, minOrMax: number, max?: number): number {
  if (max === undefined) {
    // min was not supplied, use 0 as default value
    return clamp(value, 0, minOrMax)
  }

  // min was supplied, use regular clamp
  return Math.min(Math.max(value, minOrMax), max)
}

export const printError = (error: unknown) => {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`)
  }
}

export const formatDate = (dateStr: string | Date, raw = false, addDays = 0): string => {
  const date = dayjs.utc(dateStr).add(addDays, 'days')

  return raw ? date.format('YYYY-MM-DD') : date.format('D MMMM YYYY')
}
