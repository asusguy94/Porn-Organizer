'use client'

import { useRouter } from 'next/navigation'
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

import { generateService, videoService } from '@service'

import styles from './add.module.css'

export type File = {
  path: string
  website: string
  site: string
  title: string
  date: string
}

type AddVideoPageProps = {
  files: File[]
  pages: number
}

export default function AddVideoPage({ files: videos, pages }: AddVideoPageProps) {
  const router = useRouter()

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>
      {!videos.length ? (
        <div className='text-center'>
          <Action label='Generate Metadata' callback={generateService.metadata} />
          <Action label='Generate VTT' callback={generateService.vtt} />
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
                {videos.map(video => (
                  <TableRow key={video.path}>
                    <TableCell>{video.website}</TableCell>
                    <TableCell>{video.site}</TableCell>
                    <TableCell>{video.path}</TableCell>
                    <TableCell>{video.title}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: 8 }}>
            <Action
              label={`Add Videos (page 1 of ${pages})`}
              callback={() => {
                videoService.addVideos(videos).then(() => {
                  router.refresh()
                })
              }}
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
function Action({ label, callback = undefined, disabled = false }: ActionProps) {
  const [isDisabled, setIsDisabled] = useState(disabled)

  const clickHandler = () => {
    if (!isDisabled) {
      setIsDisabled(true)

      if (callback !== undefined) {
        callback()
        setIsDisabled(false)
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
