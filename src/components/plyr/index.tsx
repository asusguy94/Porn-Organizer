import { useEffect } from 'react'

import Plyr from 'plyr'

import { settingsConfig } from '@config'

type PlyrProps = {
  plyrRef: React.MutableRefObject<Plyr | null>
  playerRef: React.RefObject<HTMLVideoElement>
  source: string
  poster: string
  thumbnail: string
}
const PlyrComponent = ({ plyrRef, playerRef, source, poster, thumbnail }: PlyrProps) => {
  useEffect(() => {
    const player = new Plyr('.plyr-js', {
      controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'settings'],
      settings: ['speed'],
      speed: { selected: 1, options: [0.75, 1, 1.25] },
      hideControls: false,
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

  return <video className='plyr-js' src={source} ref={playerRef} />
}

export type PlyrWithMetadata = Plyr & { media: HTMLVideoElement }
export default PlyrComponent
