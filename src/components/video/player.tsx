import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { Button, TextField } from '@mui/material'

import Hls, { HlsConfig, HlsListeners } from 'hls.js'
import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { useSessionStorage } from 'usehooks-ts'
import { useKey } from 'react-use'

import Plyr, { PlyrWithMetadata } from '../plyr'
import { IconWithText } from '../icon'
import { ModalHandler, Modal } from '../modal'
import Spinner from '../spinner'

import { videoService } from '@service'
import { Bookmark, General, SetState, Video, VideoStar } from '@interfaces'
import { serverConfig, settingsConfig } from '@config'

const useHls = (
  video: Video,
  plyrRef: React.MutableRefObject<PlyrWithMetadata | null>,
  hlsConfig: Partial<HlsConfig>
) => {
  const playAddedRef = useRef(false)
  const newVideoRef = useRef(false)

  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  const [events, setEvents] = useState(false)
  const [fallback, setFallback] = useState(false)

  useEffect(() => {
    if (plyrRef.current !== null) {
      newVideoRef.current = localVideo !== video.id
      if (localVideo !== video.id) {
        setLocalVideo(video.id)
        setLocalBookmark(0)
      }
      setEvents(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plyrRef])

  useEffect(() => {
    if (plyrRef.current === null) return

    if (events) {
      const player = plyrRef.current

      const onTimeupdate = () => {
        if (player.currentTime > 0) {
          setLocalBookmark(Math.round(player.currentTime))
        }
      }

      const onPlay = () => {
        if (newVideoRef.current && !playAddedRef.current) {
          playAddedRef.current = true

          videoService
            .addPlay(video.id)
            .then(() => {
              console.log('Play Added')
            })
            .catch(() => {
              playAddedRef.current = false
            })
        }
      }

      player.on('timeupdate', onTimeupdate)
      player.on('play', onPlay)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (plyrRef.current === null) return

    if (events) {
      const player = plyrRef.current

      if (Hls.isSupported()) {
        const hls = new Hls(hlsConfig)

        hls.loadSource(`${serverConfig.api}/video/${video.id}/hls`)
        hls.attachMedia(player.media)

        const onLoad: HlsListeners[typeof Hls.Events.MANIFEST_PARSED] = (e, data) => {
          if (settingsConfig.debug) {
            console.log(e, data)
          }

          hls.autoLevelCapping = data.levels.filter(level => level.height <= settingsConfig.player.quality).length
          hls.startLoad(localBookmark)
        }

        const onError: HlsListeners[typeof Hls.Events.ERROR] = (e, data) => {
          if (settingsConfig.debug) {
            console.log(e, data)
          }

          if (data.fatal) {
            hls.off(Hls.Events.ERROR, onError)
            hls.off(Hls.Events.MANIFEST_PARSED, onLoad)
            setFallback(true)
          }
        }

        hls.once(Hls.Events.MANIFEST_PARSED, onLoad)
        hls.on(Hls.Events.ERROR, onError)
      } else {
        setFallback(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (plyrRef.current === null) return

    if (fallback) {
      plyrRef.current.media.src = `${serverConfig.api}/video/${video.id}/file`
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback])
}

type VideoPlayerProps = {
  video: Video
  categories?: General[]
  bookmarks: Bookmark[]
  star: VideoStar | null
  plyrRef: React.MutableRefObject<PlyrWithMetadata | null>
  update: {
    video: SetState<Video | undefined>
    star: SetState<VideoStar | null>
    bookmarks: SetState<Bookmark[]>
  }
  onModal: ModalHandler
  modalData: Modal
}

const VideoPlayer = ({ video, categories, bookmarks, star, plyrRef, update, onModal, modalData }: VideoPlayerProps) => {
  const router = useRouter()

  useHls(video, plyrRef, { maxBufferLength: Infinity, autoStartLoad: false })

  const isArrow = (e: KeyboardEvent) => /^Arrow(Left|Right|Up|Down)$/.test(e.code)
  const isMute = (e: KeyboardEvent) => e.code === 'KeyM'
  const isSpace = (e: KeyboardEvent) => e.code === 'Space'

  useKey(
    e => !modalData.visible && (isArrow(e) || isMute(e) || isSpace(e)),
    e => {
      const player = plyrRef.current

      if (player === null || (e.target as HTMLElement).tagName === 'INPUT') return

      e.preventDefault()

      const getSeekTime = (multiplier = 1) => 1 * multiplier

      if (isMute(e)) {
        player.muted = !player.muted
      } else if (isSpace(e)) {
        if (player.playing) player.pause()
        else player.play()
      } else {
        switch (e.code) {
          case 'ArrowLeft':
            player.currentTime -= getSeekTime()
            break
          case 'ArrowRight':
            player.currentTime += getSeekTime()
            break
          case 'ArrowUp':
            player.volume = Math.ceil((player.volume + 0.1) * 10) / 10
            break
          case 'ArrowDown':
            player.volume = Math.floor((player.volume - 0.1) * 10) / 10
            break
        }
      }
    }
  )

  const handleWheel = (e: React.WheelEvent) => {
    if (plyrRef.current === null) return

    plyrRef.current.currentTime += 10 * Math.sign(e.deltaY) * -1
  }

  const deleteVideo = () => {
    videoService.delete(video.id).then(() => {
      router.replace('/')
    })
  }

  const addBookmark = (category: General) => {
    if (plyrRef.current === null) return null

    const time = Math.round(plyrRef.current.currentTime)
    if (time) {
      videoService.addBookmark(video.id, category.id, time).then(({ data }) => {
        bookmarks.push({
          id: data.id,
          category: { id: category.id, name: category.name },
          start: data.start
        })

        update.bookmarks([...bookmarks].sort((a, b) => a.start - b.start))
      })
    }
  }

  const clearBookmarks = () => {
    videoService.removeBookmark(video.id).then(() => update.bookmarks([]))
  }

  const resetPlays = () => {
    videoService.removePlays(video.id).then(() => {
      update.video({ ...video, plays: 0 })
    })
  }

  const renameVideo = (path: string) => {
    videoService.rename(video.id, path).then(() => {
      router.reload()
    })
  }

  if (categories === undefined) return <Spinner />

  return (
    <div onWheel={handleWheel}>
      <ContextMenuTrigger id='video'>
        <Plyr
          plyrRef={plyrRef}
          source={`${serverConfig.api}/video/${video.id}/file`}
          poster={`${serverConfig.api}/video/${video.id}/image`}
          thumbnail={`${serverConfig.api}/video/${video.id}/vtt`}
        />
      </ContextMenuTrigger>

      <ContextMenu id='video'>
        <IconWithText
          component={MenuItem}
          icon='add'
          text='Add Bookmark'
          onClick={() => {
            onModal(
              'Add Bookmark',
              categories.map(category => (
                <Button
                  variant='outlined'
                  color='primary'
                  key={category.id}
                  onClick={() => {
                    onModal()
                    addBookmark(category)
                  }}
                >
                  {category.name}
                </Button>
              )),
              true
            )
          }}
        />

        <hr />

        <IconWithText
          component={MenuItem}
          icon='edit'
          text='Rename File'
          onClick={() => {
            onModal(
              'Rename Video',
              <TextField
                variant='outlined'
                label='File'
                defaultValue={video.path.file}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    onModal()

                    renameVideo((e.target as HTMLInputElement).value)
                  }
                }}
                className='wider'
              />
            )
          }}
        />

        <hr />

        <IconWithText
          component={MenuItem}
          icon='delete'
          text='Remove Bookmarks'
          disabled={!bookmarks.length}
          onClick={clearBookmarks}
        />

        <IconWithText component={MenuItem} icon='delete' text='Remove Plays' onClick={() => resetPlays()} />

        <IconWithText
          component={MenuItem}
          icon='delete'
          text='Remove Video'
          disabled={star !== null || bookmarks.length > 0}
          onClick={deleteVideo}
        />
      </ContextMenu>
    </div>
  )
}

export default VideoPlayer
