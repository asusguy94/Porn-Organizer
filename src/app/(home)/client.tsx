'use client'

import { NextPage } from 'next/types'

import { Grid } from '@mui/material'

import capitalize from 'capitalize'

import { ResponsiveImage } from '@components/image'
import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'

import { serverConfig } from '@config'

import classes from './home.module.scss'

type Video = {
  id: number
  name: string
  image: string | null
  total?: number
}

type ColumnProps = {
  label: string
  cols: number
  videos: Video[]
}
export const Column = ({ videos, label, cols }: ColumnProps) => (
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
                  src={`${serverConfig.api}/video/${video.id}/image`}
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

export type HomeProps = {
  data: { label: string; cols: number; videos: Video[] }[]
}

const Home: NextPage<HomeProps> = ({ data }) => (
  <Grid container>
    {data.map(item => (
      <Column key={item.label} label={item.label} videos={item.videos} cols={item.cols} />
    ))}
  </Grid>
)

export default Home
