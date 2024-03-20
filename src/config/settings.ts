function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const value = import.meta.env[`VITE_${label}`] ?? localStorage.getItem(label)

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
  maxRetiredYears: getValueWithType<number>('MAX_RETIRED_YEARS', 1),
  userAction: {
    thumbnail: {
      close: getValueWithType<'reload' | 'close'>('USER_THUMB', 'reload') === 'close'
    }
  }
}
