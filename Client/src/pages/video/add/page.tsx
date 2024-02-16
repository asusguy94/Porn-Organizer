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

import axios from 'axios'

import { serverConfig } from '@/config'
import { generateService, videoService } from '@/service'
import { File } from '@/types'

import Progress from './progress'

import styles from './add.module.css'

export default function AddVideoPage() {
  const [newFiles, setNewFiles] = useState<File[]>([])

  useEffect(() => {
    axios.get<File[]>(`${serverConfig.api}/video/add`).then(({ data }) => setNewFiles(data))
  }, [])

  const videos = newFiles.slice(0, 33)
  const pages = Math.ceil(newFiles.length / videos.length) || 0

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>
      {!videos.length ? (
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
                  location.reload()
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
