import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { DefaultObj } from '@components/search/sort'

import { AllowString } from '@interfaces'

type ParamValue<T, K extends keyof T> = T[K] extends string ? AllowString<T[K]> : never

export function useDynamicSearchParam<T extends DefaultObj>(defaultValue: T) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const currentSearchParams = new URLSearchParams([...(searchParams?.entries() ?? [])])

  const setParam = <K extends keyof T & string>(param: K, value: ParamValue<T, K>) => {
    if (value !== defaultValue[param]) {
      currentSearchParams.set(param, value)
    } else {
      currentSearchParams.delete(param)
    }
  }

  const update = () => {
    router.replace(`${pathname}?${currentSearchParams.toString()}`, { scroll: false })
  }

  return { setParam, update }
}

export function useAllSearchParams<T extends Record<string, string>>(defaultParams: T): T {
  const searchParams = useSearchParams()

  const result: Record<string, string> = {}
  for (const key in defaultParams) {
    const searchParam = searchParams?.get(key) ?? null

    if (searchParam !== null) {
      result[key] = searchParam
    } else {
      result[key] = defaultParams[key]
    }
  }

  return result as T
}

export function useSearchParam<T extends DefaultObj>(defaultParams: T, label: string & keyof T) {
  const params = useAllSearchParams(defaultParams)

  return {
    currentValue: params[label] as string & T[typeof label],
    defaultValue: defaultParams[label] as string & T[typeof label]
  }
}
