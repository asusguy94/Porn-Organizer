function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = import.meta.env[label] ?? localStorage.getItem(label)

    if (value !== null) {
      try {
        // Always attempt JSON parsing first
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  THUMB_RES: parseInt(import.meta.env.THUMBNAIL_RES ?? '290'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  IMAGE_RES: parseInt(import.meta.env.IMAGE_RES ?? '1920'),
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  THEPORNDB_API: import.meta.env.THEPORNDB_API ?? '',
  userAction: {
    thumbnail: {
      close: getValueWithType<'reload' | 'close'>('USER_THUMB', 'reload') === 'close'
    }
  },
  pusher: {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    appId: import.meta.env.PUSHER_APP_ID ?? '',
    key: getValueWithType('PUSHER_KEY', ''),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    secret: import.meta.env.PUSHER_SECRET ?? '',
    cluster: getValueWithType('PUSHER_CLUSTER', 'eu')
  }
}
