import { Fragment, useEffect } from 'react'

import { Button, Grid } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { useWindowSize } from 'usehooks-ts'

import { IconWithText } from '../icon'
import type { ModalHandler } from '../modal'
import Spinner from '../spinner'

import { Bookmark, General, SetState, Video } from '@interfaces'
import { bookmarkService } from '@service'
import { settingsConfig } from '@config'

import styles from './timeline.module.scss'

type TimelineProps = {
  video: Video
  bookmarks: Bookmark[]
  categories?: General[]
  playVideo: (time: number) => void
  update: SetState<Bookmark[]>
  onModal: ModalHandler
}
const Timeline = ({ bookmarks, video, playVideo, categories, update, onModal }: TimelineProps) => {
  const windowSize = useWindowSize()

  const setTime = (bookmark: Bookmark) => {
    const player = document.getElementsByTagName('video')[0]
    const time = Math.round(player.currentTime)

    bookmarkService.setTime(bookmark.id, time).then(() => {
      update(
        [...bookmarks]
          .map(bookmarkItem => {
            if (bookmarkItem.id === bookmark.id) {
              bookmarkItem.start = time
            }
            return bookmarkItem
          })
          .sort((a, b) => a.start - b.start)
      )
    })
  }

  const removeBookmark = (bookmark: Bookmark) => {
    bookmarkService.delete(bookmark.id).then(() => {
      update(bookmarks.filter(item => item.start !== bookmark.start))
    })
  }

  const changeCategory = (category: General, bookmark: Bookmark) => {
    bookmarkService.setCategory(bookmark.id, category.id).then(() => {
      update(
        bookmarks.map(bookmarkItem => {
          if (bookmarkItem.start === bookmark.start) bookmarkItem.category = category

          return bookmarkItem
        })
      )
    })
  }

  const collisionCheck = (a: HTMLElement, b: HTMLElement) => {
    const aRect = a.getBoundingClientRect()
    const bRect = b.getBoundingClientRect()

    return !(
      aRect.x + aRect.width < bRect.x - settingsConfig.timeline.spacing ||
      bRect.x + settingsConfig.timeline.spacing > bRect.x + bRect.width
    )
  }

  const setDataLevel = (item: HTMLElement, level: number) => {
    if (level > 0) {
      item.setAttribute('data-level', level.toString())
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const bookmarksArr: HTMLElement[] = []
  useEffect(() => {
    const LEVEL_MIN = 1

    let level = LEVEL_MIN
    bookmarksArr.forEach((item, idx, arr) => {
      if (idx > 0) {
        const collision = arr.some((other, i) => i < idx && collisionCheck(other, item))

        level = collision ? level + 1 : LEVEL_MIN
      }

      setDataLevel(item, level)
    })
  }, [bookmarksArr, windowSize.width])

  if (categories === undefined) return <Spinner />

  return (
    <Grid id={styles.timeline}>
      {bookmarks.map((bookmark, idx) => (
        <Fragment key={bookmark.start}>
          <ContextMenuTrigger id={`bookmark-${bookmark.start}`}>
            <Button
              className={styles.bookmark}
              size='small'
              variant='outlined'
              color='primary'
              style={{ left: `${((bookmark.start * 100) / video.duration) * settingsConfig.timeline.offset}%` }}
              onClick={() => playVideo(bookmark.start)}
              ref={(bookmark: HTMLButtonElement) => (bookmarksArr[idx] = bookmark)}
              data-level={1}
            >
              {bookmark.category.name}
            </Button>
          </ContextMenuTrigger>

          <ContextMenu id={`bookmark-${bookmark.start}`}>
            <IconWithText
              component={MenuItem}
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

            <IconWithText component={MenuItem} icon='time' text='Change Time' onClick={() => setTime(bookmark)} />

            <hr />

            <IconWithText component={MenuItem} icon='delete' text='Delete' onClick={() => removeBookmark(bookmark)} />
          </ContextMenu>
        </Fragment>
      ))}
    </Grid>
  )
}

export default Timeline
