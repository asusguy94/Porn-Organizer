'use client'

import { Grid } from '@mui/material'

import capitalize from 'capitalize'

import { ResponsiveImage } from '@/components/image'
import Link from '@/components/link'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import Spinner from '@/components/spinner'
import { serverConfig } from '@/config'
import { homeService } from '@/service'

import classes from './home.module.css'

type ColumnProps = {
  label: string
  cols: number
  rows?: number
}
function Column({ label, cols, rows = 1 }: ColumnProps) {
  const { data: videos } = homeService.useVideos(label, cols * rows)

  if (videos === undefined) return <Spinner />

  return (
    <Grid container component='section' style={{ marginBottom: '0.5em' }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>
        {capitalize(label)} (<span style={{ color: 'green' }}>{videos.length}</span>)
      </h2>

      <Grid container spacing={2} columns={cols}>
        {videos.map((video, idx) => {
          const isMissing = video.image === null

          return (
            <Grid item xs={1} key={video.id}>
              <Link href={`/video/${video.id}`}>
                <RibbonContainer className={classes.video} style={isMissing ? { textAlign: 'center' } : {}}>
                  <ResponsiveImage
                    src={`${serverConfig.newApi}/video/${video.id}/image`}
                    width={185}
                    height={105}
                    missing={isMissing}
                    className={classes.thumb}
                    alt='video'
                    priority={idx % cols === 0}
                    sizes={`${100 / cols}vw`}
                  />

                  <div className={classes.title}>{video.name}</div>

                  {video.total !== undefined && <Ribbon label={video.total} />}
                </RibbonContainer>
              </Link>
            </Grid>
          )
        })}
      </Grid>
    </Grid>
  )
}

export default function HomePage() {
  return (
    <Grid container>
      <Column label='recent' cols={12} />
      <Column label='newest' cols={12} />
      <Column label='popular' cols={10} rows={3} />
    </Grid>
  )
}
