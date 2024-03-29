import dayjs, { Dayjs } from 'dayjs'
import duration from 'dayjs/plugin/duration'
import utc from 'dayjs/plugin/utc'

import { settingsConfig } from './config'

dayjs.extend(utc)
dayjs.extend(duration)

export function daysToYears(days: number) {
  return Math.floor(dayjs.duration({ days }).asYears())
}

export function getUnique<T extends object>(arr: T[], prop: keyof T): T[]
export function getUnique<T>(arr: T[]): T[]
export function getUnique<T>(arr: T[], prop?: keyof T): T[] {
  if (prop !== undefined) {
    return arr.filter((obj, idx) => arr.findIndex(item => item[prop] === obj[prop]) === idx)
  }

  return [...new Set(arr)]
}

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

export function formatDate(dateStr: string | Date, raw = false, addDays = 0): string {
  const date = dayjs.utc(dateStr).add(addDays, 'days')

  return raw ? date.format('YYYY-MM-DD') : date.format('D MMMM YYYY')
}

export function retiredUtil(newestDate: Date | Dayjs) {
  const currentDate = dayjs()
  const latestDate = dayjs(newestDate)

  const yearDiff = currentDate.diff(latestDate, 'year')
  const shouldBeRetired = yearDiff > settingsConfig.maxRetiredYears

  return { yearDiff, shouldBeRetired }
}
