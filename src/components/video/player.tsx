import { useRouter } from 'next/navigation'

import { Button, TextField } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'

import Player, { MediaPlayerInstance } from '@components/vidstack'

import { IconWithText } from '../icon'
import { Modal, ModalHandler } from '../modal'
import Spinner from '../spinner'

import { serverConfig } from '@config'
import { Bookmark, General, SetState, Video, VideoStar } from '@interfaces'
import { videoService } from '@service'

type VideoPlayerProps = {
  video: Video
  categories?: General[]
  bookmarks: Bookmark[]
  star: VideoStar | null
  playerRef: React.RefObject<MediaPlayerInstance>
  update: {
    video: SetState<Video | undefined>
    star: SetState<VideoStar | null>
    bookmarks: SetState<Bookmark[]>
  }
  modal: { data: Modal; handler: ModalHandler }
}

export default function VideoPlayer({
  video,
  categories,
  bookmarks,
  star,
  playerRef,
  update,
  modal
}: VideoPlayerProps) {
  const router = useRouter()

  const deleteVideo = () => {
    videoService.delete(video.id).then(() => {
      router.replace('/')
    })
  }

  const addBookmark = (category: General) => {
    if (playerRef.current === null) return null

    const time = Math.round(playerRef.current.currentTime)
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
      router.refresh()
    })
  }

  if (categories === undefined) return <Spinner />

  return (
    <>
      <ContextMenuTrigger id='video'>
        <Player
          title={video.name}
          playerRef={playerRef}
          video={video}
          poster={`${serverConfig.api}/video/${video.id}/image`}
          thumbnails={`${serverConfig.api}/video/${video.id}/vtt`}
          src={{
            video: `${serverConfig.api}/video/${video.id}/file`,
            hls: `${serverConfig.api}/video/${video.id}/hls`
          }}
          modal={modal.data}
        />
      </ContextMenuTrigger>

      <ContextMenu id='video'>
        <IconWithText
          component={ContextMenuItem}
          icon='add'
          text='Add Bookmark'
          onClick={() => {
            modal.handler(
              'Add Bookmark',
              categories.map(category => (
                <Button
                  variant='outlined'
                  color='primary'
                  key={category.id}
                  onClick={() => {
                    modal.handler()
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
          component={ContextMenuItem}
          icon='edit'
          text='Rename File'
          onClick={() => {
            modal.handler(
              'Rename Video',
              <TextField
                variant='outlined'
                label='File'
                defaultValue={video.path.file}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    modal.handler()

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
          component={ContextMenuItem}
          icon='delete'
          text='Remove Bookmarks'
          disabled={!bookmarks.length}
          onClick={clearBookmarks}
        />

        <IconWithText component={ContextMenuItem} icon='delete' text='Remove Plays' onClick={() => resetPlays()} />

        <IconWithText
          component={ContextMenuItem}
          icon='delete'
          text='Remove Video'
          disabled={star !== null || bookmarks.length > 0}
          onClick={deleteVideo}
        />
      </ContextMenu>
    </>
  )
}
