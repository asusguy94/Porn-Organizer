import { Fragment, useEffect } from 'react'

import { Button, Grid } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useWindowSize } from 'usehooks-ts'

import Icon from '../icon'
import type { IModalHandler } from '../modal'

import { IBookmark, IGeneral, ISetState, IVideo } from '@interfaces'
import { settingsConfig } from '@config'

import styles from './timeline.module.scss'
import { bookmarkApi } from '@api'

interface TimelineProps {
  video: IVideo
  bookmarks: IBookmark[]
  categories: IGeneral[]
  playVideo: (time: number) => void
  duration: number
  update: ISetState<IBookmark[]>
  onModal: IModalHandler
}
const Timeline = ({ bookmarks, video, playVideo, categories, duration, update, onModal }: TimelineProps) => {
  const windowSize = useWindowSize()

  // Only show warning once
  useEffect(() => {
    if (duration && video.duration) {
      if (Math.abs(duration - video.duration) >= settingsConfig.maxDurationDiff) {
        alert('invalid video-duration')

        console.log('dur', duration)
        console.log('vDur', video.duration)
        console.log(`difference of ${(video.duration - duration).toFixed(2)}`)

        console.log('')

        console.log('Re-Transcode to fix this issue')
      }
    }
  }, [duration, video.duration])

  const setTime = (bookmark: IBookmark) => {
    const player = document.getElementsByTagName('video')[0]
    const time = Math.round(player.currentTime)

    bookmarkApi.setTime(bookmark.id, time).then(() => {
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

  const removeBookmark = (bookmark: IBookmark) => {
    bookmarkApi.delete(bookmark.id).then(() => {
      update([...bookmarks].filter(item => item.start !== bookmark.start))
    })
  }

  const changeCategory = (category: IGeneral, bookmark: IBookmark) => {
    bookmarkApi.setCategory(bookmark.id, category.id).then(() => {
      update(
        [...bookmarks].map(bookmarkItem => {
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

  return (
    <Grid id={styles.timeline}>
      {bookmarks.map((bookmark, i) => (
        <Fragment key={bookmark.start}>
          <ContextMenuTrigger id={`bookmark-${bookmark.start}`}>
            <Button
              className={styles.bookmark}
              size='small'
              variant='outlined'
              color='primary'
              style={{
                left: `${((bookmark.start * 100) / duration) * settingsConfig.timeline.offset}%`
              }}
              onClick={() => playVideo(bookmark.start)}
              ref={(bookmark: HTMLButtonElement) => (bookmarksArr[i] = bookmark)}
              data-level={1}
            >
              {bookmark.category.name}
            </Button>
          </ContextMenuTrigger>

          <ContextMenu id={`bookmark-${bookmark.start}`}>
            <MenuItem
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
            >
              <Icon code='edit' /> Change Category
            </MenuItem>

            <MenuItem onClick={() => setTime(bookmark)}>
              <Icon code='clock' /> Change Time
            </MenuItem>

            <MenuItem divider />

            <MenuItem onClick={() => removeBookmark(bookmark)}>
              <Icon code='trash' /> Delete
            </MenuItem>
          </ContextMenu>
        </Fragment>
      ))}
    </Grid>
  )
}

export default Timeline
