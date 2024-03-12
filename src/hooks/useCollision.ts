import { useCallback } from 'react'

import { defaultSettings, useSettings } from '@/components/settings/components'

//TODO could probably use "useIntersection-hook"
export default function useCollision() {
  const localSettings = useSettings()

  const collisionCheck = useCallback(
    (a: HTMLElement | null, b: HTMLElement | null) => {
      if (a === null || b === null) return false

      const spacing = localSettings?.bookmark_spacing ?? defaultSettings.bookmark_spacing

      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()

      return aRect.x + aRect.width >= bRect.x - spacing && aRect.x - spacing <= bRect.x + bRect.width
    },
    [localSettings?.bookmark_spacing]
  )

  return { collisionCheck }
}
