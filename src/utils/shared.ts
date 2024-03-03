import { DefaultError, QueryClient, QueryKey, UseMutateAsyncFunction, UseMutateFunction } from '@tanstack/react-query'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

dayjs.extend(utc)

export function getUnique<T extends object>(arr: T[], prop: keyof T): T[]
export function getUnique<T>(arr: T[]): T[]
export function getUnique<T>(arr: T[], prop?: keyof T): T[] {
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

export function printError(error: unknown) {
  if (error instanceof Error) {
    console.error(`Error: ${error.message}`)
  }
}

export function formatDate(dateStr: string | Date, raw = false, addDays = 0): string {
  const date = dayjs.utc(dateStr).add(addDays, 'days')

  return raw ? date.format('YYYY-MM-DD') : date.format('D MMMM YYYY')
}

export function getProgress(index: number, total: number) {
  return {
    progress: clamp((index + 1) / (total + 1), 1),
    buffer: clamp((index + 2) / (total + 1), 1)
  }
}

type MutateAndInvalidateProps<TData, TResult> = {
  mutate: UseMutateFunction<TResult, DefaultError, TData>
  queryClient: QueryClient
  queryKey: QueryKey
  variables: TData
  reloadByDefault?: boolean
  exact?: boolean
}

export function mutateAndInvalidate<TData, TResult>({
  mutate,
  queryClient,
  queryKey,
  variables,
  reloadByDefault = true,
  exact = true
}: MutateAndInvalidateProps<TData, TResult>) {
  return mutate(variables, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey, exact })

      if (reloadByDefault) {
        location.reload()
      }
    }
  })
}

type MutateAndInvalidateAllProps<TData, TResult> = {
  mutate: UseMutateAsyncFunction<TResult, DefaultError, TData>
  queryClient: QueryClient
  queryKey: QueryKey
  variables: TData[]
  reloadByDefault?: boolean
  exact?: boolean
}

export function mutateAndInvalidateAll<TData, TResult>({
  mutate,
  queryClient,
  queryKey,
  variables,
  reloadByDefault = false,
  exact = true
}: MutateAndInvalidateAllProps<TData, TResult>) {
  Promise.allSettled(variables.map(variable => mutate(variable))).then(() => {
    if (reloadByDefault) {
      location.reload()
    } else {
      queryClient.invalidateQueries({ queryKey, exact })
    }
  })
}
