import { useEffect, useState } from 'react'

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

import { createFileRoute } from '@tanstack/react-router'

import MuiProgress from '@/components/progress'
import Spinner from '@/components/spinner'

import { generateService, videoService } from '@/service'
import socket from '@/utils/pusher/client'
import { EventsForChannel } from '@/utils/pusher/types'

import styles from './add.module.css'

export const Route = createFileRoute('/video/add')({
  component: AddVideoPage
})

function AddVideoPage() {
  const { data } = videoService.useNew()
  const { mutate } = videoService.useAddVideos()

  if (data === undefined) return <Spinner />

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>
      {data.files.length === 0 ? (
        <div className='text-center'>
          <Action label='Generate Metadata' callback={generateService.metadata} />
          <Action label='Generate VTT' callback={generateService.vtt} />

          <Progress />
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
                {data.files.map(file => (
                  <TableRow key={file.path}>
                    <TableCell>{file.website}</TableCell>
                    <TableCell>{file.site}</TableCell>
                    <TableCell>{file.path}</TableCell>
                    <TableCell>{file.title}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <div style={{ marginTop: 8 }}>
            <Action label={`Add Videos (page 1 of ${data.pages})`} callback={() => mutate({ videos: data.files })} />
          </div>
        </>
      )}
    </Grid>
  )
}

type ActionProps = {
  label: string
  callback?: (() => void) | (() => Promise<void>)
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

function Progress() {
  return (
    <div style={{ padding: '1em' }}>
      <ProgressItem event='vtt' label='Thumbnails' />
      <ProgressItem event='generate-video-info' label='Generate Video Info' />
      <ProgressItem event='generate-video' label='Generate Video' />
      <ProgressItem event='generate-star' label='Generate Stars' />
    </div>
  )
}

type ProgressItemProps = {
  event: EventsForChannel<'ffmpeg'>['name']
  label: string
}

function ProgressItem({ event, label }: ProgressItemProps) {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const channel = socket.subscribe('ffmpeg', { name: event, callback: log => setProgress(log.progress) })

    return () => {
      socket.unsubscribe(channel)
    }
  }, [event])

  return <MuiProgress label={label} value={Math.floor(progress * 100)} />
}
