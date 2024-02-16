function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    const value = (import.meta.env[label] as unknown) ?? localStorage.getItem(`VITE_${label}`)

    if (value !== null) {
      try {
        // Always attempt JSON parsing first
        return JSON.parse(value as string) as T
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
  userAction: {
    thumbnail: {
      close: getValueWithType<'reload' | 'close'>('USER_THUMB', 'reload') === 'close'
    }
  },
  pusher: {
    appId: (import.meta.env['PUSHER_APP_ID'] as unknown) ?? '',
    key: getValueWithType('PUSHER_KEY', ''),
    secret: (import.meta.env['PUSHER_SECRET'] as unknown) ?? '',
    cluster: getValueWithType('PUSHER_CLUSTER', 'eu')
  },
  debug: getValueWithType<boolean>('DEBUG', false),
  remote: getValueWithType<string>('REMOTE', 'http://localhost:3001')
}
