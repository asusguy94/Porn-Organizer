function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    const value = import.meta.env[label] ?? localStorage.getItem(label)

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
  timeline: {
    spacing: getValueWithType<number>('TIMELINE_SPACING', 0)
  },
  maxRetiredYears: getValueWithType<number>('MAX_RETIRED_YEARS', 1),
  THUMB_RES: parseInt(import.meta.env.THUMBNAIL_RES ?? '290'),
  IMAGE_RES: parseInt(import.meta.env.IMAGE_RES ?? '1920'),
  THEPORNDB_API: import.meta.env.THEPORNDB_API ?? '',
  userAction: {
    thumbnail: {
      close: getValueWithType<'reload' | 'close'>('USER_THUMB', 'reload') === 'close'
    }
  },
  pusher: {
    appId: import.meta.env['PUSHER_APP_ID'] ?? '',
    key: getValueWithType('PUSHER_KEY', ''),
    secret: import.meta.env['PUSHER_SECRET'] ?? '',
    cluster: getValueWithType('PUSHER_CLUSTER', 'eu')
  }
}
