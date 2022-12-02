import React, { RefObject, useEffect, useRef, useState } from 'react'

import { Button, Card, List, ListItem, TextField } from '@mui/material'

import Hls, { ErrorDetails } from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useSessionStorage } from 'usehooks-ts'
import { useKey } from 'react-use'

import Plyr from '../plyr'
import Icon from '../icon'
import type { IModalHandler, IModal } from '../modal'

import { videoApi } from '@api'
import { IBookmark, IGeneral, IndexType, ISetState, IVideo, IVideoStar } from '@interfaces'
import { serverConfig } from '@config'

interface VideoPlayerProps {
  video: IVideo
  categories: IGeneral[]
  bookmarks: IBookmark[]
  star: IVideoStar | null
  plyrRef: RefObject<any>
  updateDuration: any
  update: {
    video: ISetState<IVideo | undefined>
    star: ISetState<IVideoStar | null | undefined>
    bookmarks: ISetState<IBookmark[]>
  }
  onModal: IModalHandler
  modalData: IModal
}
const VideoPlayer = ({
  video,
  categories,
  bookmarks,
  star,
  plyrRef,
  updateDuration,
  update,
  onModal,
  modalData
}: VideoPlayerProps) => {
  const playAddedRef = useRef(false)
  const [localVideo, setLocalVideo] = useSessionStorage('video', 0)
  const [localBookmark, setLocalBookmark] = useSessionStorage('bookmark', 0)

  const [newVideo, setNewVideo] = useState<boolean>()
  const [events, setEvents] = useState(false)
  const [fallback, setFallback] = useState(false)

  const isArrow = (e: KeyboardEvent) => /^Arrow(Left|Right|Up|Down)$/.test(e.code)
  const isMute = (e: KeyboardEvent) => e.code === 'KeyM'
  const isSpace = (e: KeyboardEvent) => e.code === 'Space'

  const getPlayer = () => plyrRef.current

  useKey(
    e => !modalData.visible && (isArrow(e) || isMute(e) || isSpace(e)),
    e => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return

      e.preventDefault()

      const player = getPlayer()
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

  // Start other Effects
  useEffect(() => {
    if (plyrRef.current !== undefined) {
      if (localVideo === video.id) {
        setNewVideo(false)
      } else {
        setNewVideo(true)
        setLocalVideo(video.id)
        setLocalBookmark(0)
      }
      setEvents(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [plyrRef])

  // Video Events
  useEffect(() => {
    if (events) {
      const player = getPlayer()

      player.on('timeupdate', () => {
        if (player.currentTime > 0) {
          setLocalBookmark(Math.round(player.currentTime))
        }
      })

      player.on('play', () => {
        if (newVideo && !playAddedRef.current) {
          playAddedRef.current = true

          videoApi
            .addPlay(video.id)
            .then(() => {
              console.log('Play Added')
              playAddedRef.current = true
            })
            .catch(() => {
              playAddedRef.current = false
            })
        }
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  // Initialize HLS
  useEffect(() => {
    if (events) {
      const player = getPlayer()

      if (Hls.isSupported()) {
        const hls = new Hls({
          maxBufferLength: Infinity,
          autoStartLoad: false
        })

        hls.loadSource(`${serverConfig.api}/video/${video.id}/hls`)
        hls.attachMedia(player.media)

        hls.once(Hls.Events.MANIFEST_PARSED, () => {
          hls.autoLevelCapping = 1

          if (!newVideo) {
            hls.startLoad(localBookmark)
          } else {
            hls.startLoad()
          }
        })

        hls.on(Hls.Events.ERROR, (e, { details }) => {
          if (details === ErrorDetails.MANIFEST_LOAD_ERROR) {
            setFallback(true)
          }
        })

        hls.on(Hls.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
      } else {
        setFallback(true)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events])

  useEffect(() => {
    if (fallback) {
      const player = getPlayer()

      player.media.src = `${serverConfig.api}/video/${video.id}/file`
      player.media.ondurationchange = () => updateDuration(player.media.duration)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fallback])

  const handleWheel = (e: React.WheelEvent) => (getPlayer().currentTime += 10 * Math.sign(e.deltaY) * -1)

  const deleteVideo = () => {
    videoApi.delete(video.id).then(() => {
      window.location.href = '/'
    })
  }

  const addBookmark = (category: IGeneral) => {
    const time = Math.round(getPlayer().currentTime)
    if (time) {
      videoApi.addBookmark(video.id, category.id, time).then(({ data }) => {
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
    videoApi.removeBookmark(video.id).then(() => update.bookmarks([]))
  }

  const resetPlays = () => {
    videoApi.removePlays(video.id).then(() => {
      update.video({ ...video, plays: 0 })
    })
  }

  const renameVideo = (path: string) => {
    videoApi.rename(video.id, path).then(() => {
      window.location.reload()
    })
  }

  const getStarInfo = () => {
    interface IStar {
      id: string
      title: string
      date: string
      performers: IndexType[]
    }

    videoApi.getStarInfo<IStar>(video.id).then(({ data }) => {
      onModal(
        'Star Details',
        <List dense>
          <ListItem>videoID: {data.id}</ListItem>
          <ListItem>videoTitle: {data.title}</ListItem>
          <ListItem>videoDate: {data.date}</ListItem>
          {data.performers.map(performer => (
            <List component={Card} key={performer.id} dense>
              <ListItem>id: {performer.id}</ListItem>
              <ListItem>name: {performer.name}</ListItem>
              <ListItem>birthday: {performer.extra.birthday}</ListItem>
              <ListItem>ethnicity: {performer.extra.ethnicity}</ListItem>
              <ListItem>nationality: {performer.extra.nationality}</ListItem>
              <ListItem>haircolor: {performer.extra.haircolor}</ListItem>
              <ListItem>height: {performer.extra.height}</ListItem>
              <ListItem>weight: {performer.extra.weight}</ListItem>
              <ListItem>cupsize: {performer.extra.cupsize}</ListItem>
            </List>
          ))}
        </List>
      )
    })
  }

  return (
    <div onWheel={handleWheel}>
      <ContextMenuTrigger id='video' holdToDisplay={-1}>
        <Plyr
          plyrRef={plyrRef}
          source={`${serverConfig.api}/video/${video.id}/file`}
          poster={`${serverConfig.api}/video/${video.id}/image`}
          thumbnail={`${serverConfig.api}/video/${video.id}/vtt`}
        />
      </ContextMenuTrigger>

      <ContextMenu id='video'>
        <MenuItem
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
        >
          <Icon code='add' /> Add Bookmark
        </MenuItem>

        <MenuItem divider />

        <MenuItem
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
        >
          <Icon code='edit' /> Rename File
        </MenuItem>

        <MenuItem onClick={getStarInfo} disabled={video.slug === null}>
          <Icon code='add' /> Get Star Info
        </MenuItem>

        <MenuItem divider />

        <MenuItem disabled={!bookmarks.length} onClick={clearBookmarks}>
          <Icon code='trash' /> Remove Bookmarks
        </MenuItem>

        <MenuItem onClick={() => resetPlays()}>
          <Icon code='trash' /> Remove Plays
        </MenuItem>

        <MenuItem disabled={star !== null || bookmarks.length > 0} onClick={deleteVideo}>
          <Icon code='trash' /> Remove Video
        </MenuItem>
      </ContextMenu>
    </div>
  )
}

export default VideoPlayer