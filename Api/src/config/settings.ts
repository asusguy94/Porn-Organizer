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
  THUMB_RES: parseInt(process.env.THUMBNAIL_RES ?? '290'),
  IMAGE_RES: parseInt(process.env.IMAGE_RES ?? '1920'),
  THEPORNDB_API: process.env.THEPORNDB_API ?? '',
  pusher: {
    appId: process.env['PUSHER_APP_ID'] ?? '',
    key: getValueWithType('PUSHER_KEY', ''),
    secret: process.env['PUSHER_SECRET'] ?? '',
    cluster: getValueWithType('PUSHER_CLUSTER', 'eu')
  }
}
