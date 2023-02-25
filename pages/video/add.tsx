import type { NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useState } from 'react'

import {
  Grid,
  Button,
  Table,
  TableContainer,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Typography,
  Paper
} from '@mui/material'

import Spinner from '@components/spinner'

import { generateService, videoService } from '@service'

import styles from './add.module.scss'

const AddVideoPage: NextPage = () => {
  const router = useRouter()

  type VideoFile = {
    path: string
    website: string
    site: string
    title: string
    date: string
  }

  const { files: videos, pages } = videoService.useNewVideos<{ files: VideoFile[]; pages: number }>().data ?? {}

  if (videos === undefined) return <Spinner />

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>
      {!videos.length ? (
        <div className='text-center'>
          <Action label='Generate Metadata' callback={() => void generateService.metadata()} />
          <Action label='Generate VTT' callback={() => void generateService.vtt()} />
        </div>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table size='small' className={styles['table-striped']}>
              <TableHead>
                <TableRow>
                  <TableCell>website</TableCell>
                  <TableCell>site</TableCell>
                  <TableCell>path</TableCell>
                  <TableCell>title</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {videos.map(video => {
                  return (
                    <TableRow key={video.path}>
                      <TableCell>{video.website}</TableCell>
                      <TableCell>{video.site}</TableCell>
                      <TableCell>{video.path}</TableCell>
                      <TableCell>{video.title}</TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: 8 }}>
            <Action
              label={`Add Videos (page 1 of ${pages ?? 0})`}
              callback={() =>
                void videoService.addVideos(videos).then(() => {
                  router.reload()
                })
              }
            />
          </div>
        </>
      )}
    </Grid>
  )
}

type ActionProps = {
  label: string
  callback?: () => void
  disabled?: boolean
}
const Action = ({ label, callback = undefined, disabled = false }: ActionProps) => {
  const [isDisabled, setIsDisabled] = useState(disabled)

  const clickHandler = () => {
    if (!isDisabled) {
      setIsDisabled(true)

      if (callback !== undefined) {
        callback()
      }
    }
  }

  return (
    <Button
      variant='outlined'
      color='primary'
      disabled={isDisabled}
      onClick={clickHandler}
      style={{ marginLeft: 6, marginRight: 6 }}
    >
      {label}
    </Button>
  )
}

export default AddVideoPage
