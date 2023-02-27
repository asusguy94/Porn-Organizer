import { getValue } from '@config'

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
  THUMB_RES: parseInt(getValue('THUMBNAIL_RES', '290')),
  THEPORNDB_API: getValue('THEPORNDB_API', '')
}
