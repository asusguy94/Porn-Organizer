function getValue(label: string, defaultValue: string): string {
  if (!label.startsWith('NEXT_PUBLIC_')) label = `NEXT_PUBLIC_${label}`

  try {
    return process.env[label] ?? localStorage[label] ?? defaultValue
  } catch (e) {
    return defaultValue
  }
}

export default {
  qualities: [1080, 720, 480, 360],
  timeline: {
    spacing: parseFloat(getValue('TIMELINE_SPACING', '0'))
  },
  player: {
    thumbnails: getValue('PLAYER_THUMBNAILS', 'false') === 'true',
  },
  THUMB_RES: parseInt(process.env.THUMBNAIL_RES ?? '290'),
  IMAGE_RES: parseInt(process.env.IMAGE_RES ?? '1920'),
  THEPORNDB_API: process.env.THEPORNDB_API ?? '',
  userAction: {
    thumbnail: {
      close: getValue('USER_THUMB', 'reload') === 'close',
      reload: getValue('USER_THUMB', 'reload') === 'reload'
    }
  }
}
