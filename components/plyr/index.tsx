import { useEffect } from 'react'

import Plyr from 'plyr'

import { settingsConfig } from '@config'

interface PlyrProps {
  plyrRef: React.MutableRefObject<any>
  source: string
  poster: string
  thumbnail: string
}
export const PlyrComponent = ({ plyrRef, source, poster, thumbnail }: PlyrProps) => {
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
        enabled: settingsConfig.thumbnails,
        src: thumbnail
      }
    })
    player.poster = poster

    plyrRef.current = player

    return () => {
      plyrRef.current = null

      player.destroy()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <video className='plyr-js' src={source} />
}

export default PlyrComponent
