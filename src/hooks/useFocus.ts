import { useEffect, useRef } from 'react'

export default function useFocus(currentValue?: string) {
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const input = ref.current
    if (input !== null) {
      if (currentValue !== undefined) {
        input.value = currentValue
      }
      input.focus()
    }
  }, [currentValue])

  return ref
}
