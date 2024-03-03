import React, { useState, useRef, useEffect } from 'react'

import { Button, Grid, Card, CardActionArea, CardContent, CardMedia, Typography } from '@mui/material'

import { Flipper, Flipped } from 'react-flip-toolkit'

import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Spinner from '@components/spinner'

import { serverConfig } from '@config'
import { Star, StarVideo } from '@interfaces'
import { starService } from '@service'
import { daysToYears } from '@utils/client/date-time'
import { getUnique } from '@utils/shared'

import styles from './star.module.scss'

type VideosProps = {
  star: Star
}
export default function Videos({ star }: VideosProps) {
  const [websites, setWebsites] = useState<string[]>([])
  const [focus, setFocus] = useState<string[]>([])
  const { data: videos } = starService.useVideos(star.id)

  const toggleFocus = (website: string) => {
    // allow multiple items to be selected
    if (focus.includes(website)) {
      // remove item from focus
      setFocus(focus.filter(item => item !== website))
    } else {
      // add item to focus
      setFocus(prev => [...prev, website])
    }
  }

  useEffect(() => {
    if (videos !== undefined) {
      setFocus([])

      setWebsites(getUnique(videos.map(video => video.website)))
    }
  }, [videos])

  if (videos === undefined) return <Spinner />

  return (
    <div>
      <Typography variant='h6'>
        {websites.length > 1 &&
          websites.map(website => (
            <Button
              key={website}
              size='small'
              variant={focus.includes(website) ? 'contained' : 'outlined'}
              color='primary'
              style={{ marginLeft: 8 }}
              onClick={() => toggleFocus(website)}
            >
              {website}
            </Button>
          ))}
      </Typography>

      <Flipper flipKey={videos.map(video => video.id)}>
        <Grid container style={{ marginTop: 8 }}>
          {videos
            .map(video => {
              if (focus.length > 0 && websites.length > 1) {
                return { ...video, hidden: !focus.includes(video.website) }
              }

              return { ...video, hidden: false }
            })
            .sort((a, b) => a.age - b.age)
            .sort((a, b) => Number(a.hidden) - Number(b.hidden))
            .map((video, idx) => (
              <Flipped key={video.id} flipId={video.id}>
                <Link className={`${styles.video} ${video.hidden ? styles.hidden : ''}`} href={`/video/${video.id}`}>
                  <Video
                    video={video}
                    isFirst={videos.length > 1 && idx === 0}
                    isLast={videos.length > 1 && idx === videos.length - 1}
                    isHidden={video.hidden}
                  />
                </Link>
              </Flipped>
            ))}
        </Grid>
      </Flipper>
    </div>
  )
}

type VideoProps = {
  video: StarVideo
  isFirst: boolean
  isLast: boolean
  isHidden: boolean
}
function Video({ video, isFirst, isLast, isHidden }: VideoProps) {
  const [src, setSrc] = useState('')
  const [dataSrc, setDataSrc] = useState(`${serverConfig.legacyApi}/video/${video.id}/file`)

  const thumbnail = useRef<NodeJS.Timeout>()

  // eslint-disable-next-line @typescript-eslint/require-await
  const reload = async () => {
    setSrc(dataSrc)
    setDataSrc('')
  }

  const unload = () => {
    setDataSrc(src)
    setSrc('')
  }

  const playFrom = (video: HTMLVideoElement, time = 0) => {
    if (time) video.currentTime = time

    video.play()
  }

  const stopFrom = (video: HTMLVideoElement, time = 0) => {
    if (time) video.currentTime = time

    video.pause()
  }

  const startThumbnailPlayback = (video: HTMLVideoElement) => {
    let time = 100
    const offset = 60
    const duration = 1.5

    playFrom(video)
    thumbnail.current = setInterval(() => {
      time += offset
      if (time > video.duration) {
        stopThumbnailPlayback(video).then(() => startThumbnailPlayback(video))
      }
      playFrom(video, (time += offset))
    }, duration * 1000)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const stopThumbnailPlayback = async (video: HTMLVideoElement) => {
    stopFrom(video)

    clearInterval(thumbnail.current)
  }

  const handleMouseEnter = ({ target }: React.MouseEvent<HTMLVideoElement> & { target: HTMLVideoElement }) => {
    if (!isHidden) {
      if (dataSrc.length && !src.length) {
        reload().then(() => startThumbnailPlayback(target))
      }
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!dataSrc.length && src.length) {
      stopThumbnailPlayback(e.currentTarget).then(() => unload())
    }
  }

  return (
    <RibbonContainer component={Card}>
      <CardActionArea>
        <CardMedia
          component='video'
          src={src}
          data-src={dataSrc}
          poster={`${serverConfig.legacyApi}/video/${video.id}/thumb`}
          preload='metadata'
          muted
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <CardContent className={styles.info}>
          <Typography className='text-center'>{video.name}</Typography>
          <Typography className={styles['site-info']}>
            <span className={styles.wsite}>{video.website}</span>

            {video.site !== null && (
              <>
                <span className='divider'>/</span>
                <span className={styles.site}>{video.site}</span>
              </>
            )}
          </Typography>

          <Ribbon isFirst={isFirst} isLast={isLast} align='left' />

          {video.age > 0 && <Ribbon label={daysToYears(video.age)} />}
        </CardContent>
      </CardActionArea>
    </RibbonContainer>
  )
}
