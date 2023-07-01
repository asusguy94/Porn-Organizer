import { NextPage } from 'next/types'

import { Grid } from '@mui/material'

import capitalize from 'capitalize'
import { useFetch } from 'usehooks-ts'

import Ribbon, { RibbonContainer } from '@components/ribbon'
import Link from '@components/link'
import { ResponsiveImage } from '@components/image'
import Spinner from '@components/spinner'

import { serverConfig } from '@config'

import classes from './home.module.scss'

type ColumnProps = {
  enabled?: boolean
  label: string
  limit?: number
  rows?: number
  colSize?: number
}
export const Column = ({ label, rows = 1, limit = -1, colSize = 10 }: ColumnProps) => {
  type Video = {
    id: number
    name: string
    image: string | null
    total?: number
  }

  if (limit === -1) {
    limit = rows * colSize
  }
  const { data: videos } = useFetch<Video[]>(`${serverConfig.api}/home/${label}/${limit}`)

  if (videos === undefined) return <Spinner />

  return (
    <Grid container component='section' style={{ marginBottom: '0.5em' }}>
      <h2 style={{ marginTop: 0, marginBottom: 0 }}>
        {capitalize(label)} (<span style={{ color: 'green' }}>{videos.length}</span>)
      </h2>

      <Grid container spacing={2} columns={colSize}>
        {videos.map((video, idx) => {
          const isMissing = video.image === null

          return (
            <Grid item xs={1} key={video.id}>
              <Link href={{ pathname: '/video/[id]', query: { id: video.id } }}>
                <RibbonContainer className={classes.video} style={isMissing ? { textAlign: 'center' } : {}}>
                  <ResponsiveImage
                    src={`${serverConfig.api}/video/${video.id}/image`}
                    width={185}
                    height={105}
                    missing={isMissing}
                    className={classes.thumb}
                    alt='video'
                    priority={idx % colSize === 0}
                    sizes={`${100 / colSize}vw`}
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

const Home: NextPage = () => (
  <Grid container>
    <Column label='recent' colSize={12} />
    <Column label='newest' colSize={12} />
    <Column label='popular' rows={3} />
  </Grid>
)

export default Home
