function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    const value = process.env[label] ?? localStorage.getItem(`NEXT_PUBLIC_${label}`)

    if (value !== null) {
      try {
        // Always attempt JSON parsing first
        return JSON.parse(value) as T
      } catch {
        // If it fails, treat the value as a raw string
        if (typeof defaultValue === 'string') {
          return value as T
        }
      }
    }

    return defaultValue
  } catch {
    return defaultValue
  }
}

export default {
  qualities: [1080, 720, 480, 360],
  timeline: {
    spacing: getValueWithType<number>('TIMELINE_SPACING', 0)
  },
  player: {
    thumbnails: getValueWithType<boolean>('PLAYER_THUMBNAILS', false),
    quality: {
      max: getValueWithType<number>('PLAYER_QUALITY_MAX', 1080)
    }
  },
  THUMB_RES: parseInt(process.env.THUMBNAIL_RES ?? '290'),
  IMAGE_RES: parseInt(process.env.IMAGE_RES ?? '1920'),
  THEPORNDB_API: process.env.THEPORNDB_API ?? '',
  userAction: {
    thumbnail: {
      close: getValueWithType<'reload' | 'close'>('USER_THUMB', 'reload') === 'close'
    }
  },
  debug: getValueWithType<boolean>('DEBUG', false)
}