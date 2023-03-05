import { useEffect } from 'react'

import Plyr from 'plyr'

import { settingsConfig } from '@config'

type PlyrProps = {
  plyrRef: React.MutableRefObject<Plyr | null>
  source: string
  poster: string
  thumbnail: string
}
const PlyrComponent = ({ plyrRef, source, poster, thumbnail }: PlyrProps) => {
  useEffect(() => {
    const player = new Plyr('.plyr-js', {
      controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'settings'],
      settings: ['speed'],
      speed: { selected: 1, options: [0.75, 1, 1.25] },
      hideControls: false,
      ratio: '21:9',
      keyboard: { focused: false },
      fullscreen: { enabled: false },
      previewThumbnails: {
        enabled: settingsConfig.player.thumbnails,
        src: thumbnail
      }
    })
    player.poster = poster

    plyrRef.current = player

    return () => {
      plyrRef.current = null

      player.destroy()
    }
  }, [plyrRef, poster, thumbnail])

  return <video className='plyr-js' src={source} />
}

export default PlyrComponent
