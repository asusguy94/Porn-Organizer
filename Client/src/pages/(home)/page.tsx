import { useEffect, useState } from 'react'

import { Grid } from '@mui/material'

import axios from 'axios'
import capitalize from 'capitalize'
import { Link } from 'react-router-dom'

import { ResponsiveImage } from '@/components/image'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import { serverConfig } from '@/config'

import classes from './home.module.css'

type Video = {
  id: number
  name: string
  image: string | null
  total?: number
}

type ColumnProps = {
  label: string
  cols: number
  rows?: number
}
function Column({ label, cols, rows = 1 }: ColumnProps) {
  const [videos, setVideos] = useState<Video[]>([])

  useEffect(() => {
    axios.get<Video[]>(`${serverConfig.api}/home/${label}/${cols * rows}`).then(({ data }) => setVideos(data))
  }, [label, cols, rows])

  return (
    <Grid container component='section' style={{ marginBottom: '0.5em' }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>
        {capitalize(label)} (<span style={{ color: 'green' }}>{videos.length}</span>)
      </h2>

      <Grid container spacing={2} columns={cols}>
        {videos.map(video => {
          const isMissing = video.image === null

          return (
            <Grid item xs={1} key={video.id}>
              <Link to={`/video/${video.id}`}>
                <RibbonContainer className={classes.video} style={isMissing ? { textAlign: 'center' } : {}}>
                  <ResponsiveImage
                    src={`${serverConfig.api}/video/${video.id}/image`}
                    width={185}
                    height={105}
                    missing={isMissing}
                    className={classes.thumb}
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
