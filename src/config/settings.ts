function getValue(label: string, defaultValue: string): string {
  try {
    return process.env[label] ?? localStorage[label] ?? defaultValue
  } catch (e) {
    return defaultValue
  }
}

export default {
  qualities: [1080, 720, 480, 360],
  timeline: {
    offset: parseFloat(getValue('NEXT_PUBLIC_TIMELINE_OFFSET', '1')),
    spacing: parseFloat(getValue('NEXT_PUBLIC_TIMELINE_SPACING', '0'))
  },
  player: {
    maxDurationDiff: parseInt(getValue('NEXT_PUBLIC_PLAYER_DURATIONDIFF', '1')),
    thumbnails: getValue('NEXT_PUBLIC_PLAYER_THUMBNAILS', 'false') === 'true'
  },
  THUMB_RES: parseInt(process.env.THUMBNAIL_RES ?? '290'),
  IMAGE_RES: parseInt(process.env.IMAGE_RES ?? '1920'),
  THEPORNDB_API: process.env.THEPORNDB_API ?? '',
  userAction: {
    thumbnail: {
      close: getValue('NEXT_PUBLIC_USER_THUMB', 'reload') === 'close',
      reload: getValue('NEXT_PUBLIC_USER_THUMB', 'reload') === 'reload'
    }
  }
}
