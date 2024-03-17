import { Grid } from '@mui/material'

import { Link, createFileRoute } from '@tanstack/react-router'
import capitalize from 'capitalize'

import Ribbon, { RibbonContainer } from '@/components/ribbon'
import Spinner from '@/components/spinner'

import { serverConfig } from '@/config'
import { homeService } from '@/service'

export const Route = createFileRoute('/')({
  component: () => (
    <Grid container>
      <Column label='recent' cols={12} />
      <Column label='newest' cols={12} />
      <Column label='popular' cols={10} rows={3} />
    </Grid>
  )
})

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
        {videos.map(video => (
          <Grid item xs={1} key={video.id}>
            <Link to='/video/$videoId' params={{ videoId: video.id }}>
              <RibbonContainer>
                <img
                  src={`${serverConfig.newApi}/video/${video.id}/image`}
                  alt='video'
                  style={{
                    width: '100%',
                    border: '1px solid #dee2e6',
                    borderRadius: '0.25rem'
                  }}
                />

                <div
                  style={{
                    color: 'black',
                    textAlign: 'center',
                    WebkitLineClamp: 3,
                    display: '-webkit-box',
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {video.name}
                </div>

                {video.total !== undefined && <Ribbon label={video.total} />}
              </RibbonContainer>
            </Link>
          </Grid>
        ))}
      </Grid>
    </Grid>
  )
}
