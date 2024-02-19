import { useRef } from 'react'

import {
  MediaPlayer,
  MediaPlayerInstance,
  MediaProvider,
  MediaProviderAdapter,
  MediaTimeUpdateEventDetail,
  Poster,
  Track,
  VTTContent,
  isHLSProvider,
  useMediaRemote
} from '@vidstack/react'
import { DefaultVideoLayout, defaultLayoutIcons } from '@vidstack/react/player/layouts/default'
import Hls, { ErrorData } from 'hls.js'
import { useSessionStorage } from 'usehooks-ts'

import { Modal } from '@components/modal'

import { settingsConfig } from '@config'
import { Bookmark, Video } from '@interfaces'
import { videoService } from '@service'

import './vidstack.css'

type PlayerProps = {
  title: string
  src: { video: string; hls: string }
  poster?: string
  thumbnails?: string
  video: Video
  playerRef: React.RefObject<MediaPlayerInstance>
  modal: Modal
  bookmarks: Bookmark[]
}

export default function Player({ src, poster, thumbnails, title, video, playerRef, modal, bookmarks }: PlayerProps) {
  const remote = useMediaRemote(playerRef)
  const hlsRef = useRef<Hls>()

  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  const canAddPlay = useRef(false)

  const chapters: VTTContent = {
    cues: bookmarks.map((bookmark, idx, arr) => ({
      startTime: bookmark.start,
      endTime: arr.at(idx + 1)?.start ?? video.duration,
      text: bookmark.category.name
    }))
  }

  const onCanLoad = () => {
    if (localVideo !== video.id) {
      setLocalVideo(video.id)
      setLocalBookmark(0)
      canAddPlay.current = true
    }
  }

  const onProviderChange = (provider: MediaProviderAdapter | null) => {
    if (provider === null) return

    if (isHLSProvider(provider)) {
      provider.library = () => import('hls.js')
      provider.config = { maxBufferLength: Infinity, autoStartLoad: false }
    }
  }

  const onTimeUpdate = (detail: MediaTimeUpdateEventDetail) => {
    // TODO ommitting this resets the video to the beginning every time
    if (detail.currentTime > 0) {
      setLocalBookmark(Math.round(detail.currentTime))
    }
  }

  const onPlay = () => {
    if (canAddPlay.current) {
      canAddPlay.current = false

      videoService
        .addPlay(video.id)
        .then(() => {
          console.log('Play Added')
        })
        .catch(() => {
          canAddPlay.current = true
        })
    }
  }

  const onManifestParsed = () => {
    if (hlsRef.current !== undefined) {
      hlsRef.current.startLoad(localBookmark)
    }
  }

  const onHlsError = (data: ErrorData) => {
    if (settingsConfig.debug) {
      console.log('onHlsError', data)
    }

    if (data.fatal) {
      // TODO do some more stuff
      hlsRef.current?.destroy()
    }
  }

  const onWheel = (e: React.WheelEvent) => {
    if (playerRef.current === null) return

    playerRef.current.currentTime += 10 * Math.sign(e.deltaY) * -1
  }

  return (
    <MediaPlayer
      ref={playerRef}
      src={[
        { src: src.video, type: 'video/mp4' },
        { src: src.hls, type: 'application/x-mpegurl' }
      ]}
      streamType='on-demand'
      load='eager'
      viewType='video'
      storage='vidstack'
      onProviderChange={onProviderChange}
      onTimeUpdate={onTimeUpdate}
      onCanLoad={onCanLoad}
      onPlay={onPlay}
      onWheel={onWheel}
      onHlsManifestParsed={onManifestParsed}
      onHlsInstance={hls => (hlsRef.current = hls)}
      onHlsError={onHlsError}
      keyDisabled={modal.visible}
      keyTarget='document'
      keyShortcuts={{
        toggleMuted: 'm',
        volumeUp: 'ArrowUp',
        volumeDown: 'ArrowDown',
        seekBackward: 'ArrowLeft',
        seekForward: 'ArrowRight',
        togglePaused: {
          keys: 'Space',
          callback: e => {
            if (e.type === 'keyup') {
              remote.togglePaused()
            }
          }
        }
      }}
    >
      <MediaProvider>
        {poster !== undefined && <Poster className='vds-poster' src={poster} alt={title} />}

        <Track kind='chapters' content={chapters} default type='json' />
      </MediaProvider>

      <DefaultVideoLayout
        thumbnails={thumbnails}
        icons={defaultLayoutIcons}
        seekStep={1}
        slots={{ googleCastButton: null, pipButton: null, fullscreenButton: null }}
        noScrubGesture={false}
      />
    </MediaPlayer>
  )
}

export type { MediaPlayerInstance }
