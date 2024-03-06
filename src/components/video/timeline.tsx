import { Fragment, useEffect, useRef, useState } from 'react'

import { Button, Grid } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'
import { useWindowSize } from 'usehooks-ts'

import { MediaPlayerInstance } from '@components/vidstack'

import { IconWithText } from '../icon'
import { ModalHandler } from '../modal'

import useCollision from '@hooks/use-collision'
import { Bookmark, General, Video } from '@interfaces'
import { bookmarkService } from '@service'

import styles from './timeline.module.css'

const spacing = { top: 3, bookmarks: 36 }

type TimelineProps = {
  video: Video
  bookmarks: Bookmark[]
  categories: General[]
  playVideo: (time: number) => void
  playerRef: React.RefObject<MediaPlayerInstance>
  onModal: ModalHandler
}
export default function Timeline({ bookmarks, video, playVideo, categories, playerRef, onModal }: TimelineProps) {
  const windowSize = useWindowSize()
  const bookmarksRef = useRef<HTMLElement[]>([])
  const [bookmarkLevels, setBookmarkLevels] = useState<number[]>([])
  const { collisionCheck } = useCollision()

  // TODO make bookmark it's own component
  const { mutate: mutateSetCategory } = bookmarkService.useSetCategory(video.id)
  const { mutate: mutateSetTime } = bookmarkService.useSetTime(video.id)
  const { mutate: mutateDelete } = bookmarkService.useDeleteBookmark(video.id)

  const setTime = (bookmark: Bookmark) => {
    const player = document.getElementsByTagName('video')[0]
    const time = Math.round(player.currentTime)

    mutateSetTime({ id: bookmark.id, time })
  }

  const removeBookmark = (bookmark: Bookmark) => {
    mutateDelete({ id: bookmark.id })
  }

  const changeCategory = (category: General, bookmark: Bookmark) => {
    mutateSetCategory({ id: bookmark.id, categoryID: category.id })
  }

  useEffect(() => {
    const bookmarksArr = bookmarks.length > 0 ? bookmarksRef.current : []
    const levels = Array<number>(bookmarks.length).fill(0)
    let maxLevel = 0

    for (let i = 0; i < bookmarksArr.length; i++) {
      let level = 1
      for (let j = 0; j < i; j++) {
        if (levels[j] === level && collisionCheck(bookmarksArr[j], bookmarksArr[i])) {
          level++
          j = -1
        }
      }

      levels[i] = level
      if (level > maxLevel) maxLevel = level
    }

    setBookmarkLevels(levels)

    const videoElement = playerRef.current?.el ?? null
    if (videoElement !== null) {
      const videoTop = videoElement.getBoundingClientRect().top
      videoElement.style.maxHeight = `calc(100vh - (${spacing.bookmarks}px * ${maxLevel}) - ${videoTop}px - ${spacing.top}px)`
    }
  }, [bookmarks, collisionCheck, playerRef, windowSize.width])

  return (
    <Grid id={styles.timeline}>
      {bookmarks.map((bookmark, idx) => (
        <Fragment key={bookmark.start}>
          <ContextMenuTrigger id={`bookmark-${bookmark.start}`}>
            <Button
              size='small'
              variant='outlined'
              color='primary'
              className={styles.bookmark}
              style={{
                left: `${(bookmark.start / video.duration) * 100}%`,
                top: `${(bookmarkLevels[idx] - 1) * spacing.bookmarks}px`
              }}
              onMouseDown={e => e.button === 0 && playVideo(bookmark.start)}
              ref={bookmark => {
                if (bookmark !== null) {
                  bookmarksRef.current[idx] = bookmark
                }
              }}
            >
              {bookmark.category.name}
            </Button>
          </ContextMenuTrigger>

          <ContextMenu id={`bookmark-${bookmark.start}`}>
            <IconWithText
              component={ContextMenuItem}
              icon='edit'
              text='Change Category'
              onClick={() => {
                onModal(
                  'Change Category',
                  categories
                    .filter(category => category.id !== bookmark.category.id)
                    .map(category => (
                      <Button
                        variant='outlined'
                        color='primary'
                        key={category.id}
                        onClick={() => {
                          onModal()
                          changeCategory(category, bookmark)
                        }}
                      >
                        {category.name}
                      </Button>
                    )),
                  true
                )
              }}
            />

            <IconWithText
              component={ContextMenuItem}
              icon='time'
              text='Change Time'
              onClick={() => setTime(bookmark)}
            />

            <hr />

            <IconWithText
              component={ContextMenuItem}
              icon='delete'
              text='Delete'
              onClick={() => removeBookmark(bookmark)}
            />
          </ContextMenu>
        </Fragment>
      ))}
    </Grid>
  )
}
