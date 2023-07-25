import React, { useState, useRef, useEffect } from 'react'

import { Button, Grid, Card, CardActionArea, CardContent, CardMedia as MUICardMedia, Typography } from '@mui/material'

import { Flipper, Flipped } from 'react-flip-toolkit'

import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Spinner from '@components/spinner'

import { serverConfig } from '@config'
import { StarVideo } from '@interfaces'
import { daysToYears } from '@utils/client/date-time'
import { getUnique } from '@utils/shared'

import styles from './star.module.scss'

type VideosProps = {
  videos?: StarVideo[]
}
const Videos = ({ videos }: VideosProps) => {
  const [websites, setWebsites] = useState<string[]>([])
  const [sites, setSites] = useState<string[]>([])

  const [focus, setFocus] = useState<string[]>([])

  const toggleFocus = (websiteOrSite: string) => {
    // allow multiple items to be selected
    if (focus.includes(websiteOrSite)) {
      // remove item from focus
      setFocus(focus.filter(item => item !== websiteOrSite))
    } else {
      // add item to focus
      setFocus(prev => [...prev, websiteOrSite])
    }
  }

  useEffect(() => {
    if (videos !== undefined) {
      setFocus([])

      setWebsites(getUnique(videos.map(video => video.website)))
      setSites(getUnique(videos.flatMap(video => (video.site !== null ? [video.site] : []))))
    }
  }, [videos])

  if (videos === undefined) return <Spinner />

  return (
    <div>
      <Typography variant='h6'>
        Videos
        {websites.length > 1
          ? websites.map(website => (
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
            ))
          : sites.length > 1
          ? sites.map(site => (
              <Button
                key={site}
                size='small'
                variant={focus.includes(site) ? 'contained' : 'outlined'}
                color='primary'
                style={{ marginLeft: 8 }}
                onClick={() => toggleFocus(site)}
              >
                {site}
              </Button>
            ))
          : null}
      </Typography>

      <Flipper flipKey={videos.map(video => video.id)}>
        <Grid container style={{ marginTop: 8 }}>
          {videos
            .map(video => {
              if (focus.length > 0) {
                if (websites.length > 1) {
                  return { ...video, hidden: !focus.includes(video.website) }
                } else if (sites.length > 1 && video.site !== null) {
                  return { ...video, hidden: !focus.includes(video.site) }
                }
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
const Video = ({ video, isFirst, isLast, isHidden }: VideoProps) => {
  const [src, setSrc] = useState('')
  const [dataSrc, setDataSrc] = useState(`${serverConfig.api}/video/${video.id}/file`)

  const thumbnail = useRef<NodeJS.Timer>()

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
        <MUICardMedia
          component='video'
          src={src}
          data-src={dataSrc}
          poster={`${serverConfig.api}/video/${video.id}/thumb`}
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

export default Videos
