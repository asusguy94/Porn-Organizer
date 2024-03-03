import { useRouter } from 'next/navigation'

import { Button, TextField } from '@mui/material'

import { useQueryClient } from '@tanstack/react-query'
import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'

import Player, { MediaPlayerInstance } from '@components/vidstack'

import { IconWithText } from '../icon'
import { Modal, ModalHandler } from '../modal'
import Spinner from '../spinner'

import { serverConfig } from '@config'
import { Bookmark, General, Video, VideoStar } from '@interfaces'
import { videoService } from '@service'
import { mutateAndInvalidate } from '@utils/shared'

type VideoPlayerProps = {
  video: Video
  categories: General[]
  bookmarks: Bookmark[]
  star: VideoStar | null
  playerRef: React.RefObject<MediaPlayerInstance>
  modal: { data: Modal; handler: ModalHandler }
}

export default function VideoPlayer({ video, categories, bookmarks, star, playerRef, modal }: VideoPlayerProps) {
  const router = useRouter()
  const { mutate } = videoService.useAddBookmark(video.id)
  const queryClient = useQueryClient()

  const deleteVideo = () => {
    videoService.delete(video.id).then(() => {
      router.replace('/')
    })
  }

  const addBookmark = (category: General) => {
    if (playerRef.current === null) return null

    const time = Math.round(playerRef.current.currentTime)
    if (time) {
      mutateAndInvalidate({
        mutate,
        queryClient,
        queryKey: ['video', video.id, 'bookmark'],
        variables: { categoryID: category.id, time }
      })
    }
  }

  const clearBookmarks = () => {
    videoService.removeBookmark(video.id).then(() => {
      location.reload()
    })
  }

  const resetPlays = () => {
    videoService.removePlays(video.id).then(() => {
      location.reload()
    })
  }

  const renameVideo = (path: string) => {
    videoService.rename(video.id, path).then(() => {
      location.reload()
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
          bookmarks={bookmarks}
          poster={`${serverConfig.legacyApi}/video/${video.id}/image`}
          thumbnails={`${serverConfig.legacyApi}/video/${video.id}/vtt`}
          src={{
            video: `${serverConfig.legacyApi}/video/${video.id}/file`,
            hls: `${serverConfig.legacyApi}/video/${video.id}/hls`
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
