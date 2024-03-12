import { useNavigate } from '@tanstack/react-router'

import { DefaultObj } from '@/components/search/sort'

import { AllowString } from '@/interface'

type ParamValue<T, K extends keyof T> = T[K] extends string ? AllowString<T[K]> : never

export function useDynamicSearchParam<T extends DefaultObj>(defaultValue: T) {
  const navigate = useNavigate()

  const currentSearchParams = new URLSearchParams(location.search)

  const setParam = <K extends keyof T & string>(param: K, value: ParamValue<T, K>) => {
    if (value !== defaultValue[param]) {
      currentSearchParams.set(param, value)
    } else {
      currentSearchParams.delete(param)
    }
  }

  const update = () => {
    navigate({
      to: location.pathname + '?' + currentSearchParams,
      replace: true,
      resetScroll: false
    })
  }

  return { setParam, update }
}

export function useAllSearchParams<T extends Record<string, string>>(defaultParams: T): T {
  const searchParams = new URLSearchParams(location.search)

  const result: Record<string, string> = {}
  for (const key in defaultParams) {
    result[key] = searchParams.get(key) ?? defaultParams[key]
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
