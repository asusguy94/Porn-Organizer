import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

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

import { generateApi, videoApi } from '@api'

import styles from './add.module.scss'

const AddVideoPage: NextPage = () => {
  interface IVideoFile {
    path: string
    website: string
    site: string
    title: string
  }

  const [videos, setVideos] = useState<IVideoFile[]>([])
  const [loaded, setLoaded] = useState(false)
  const [pages, setPages] = useState(0)

  useEffect(() => {
    videoApi
      .newVideos<{ files: IVideoFile[]; pages: number }>()
      .then(({ data }) => {
        setVideos(data.files)
        setPages(data.pages)
      })
      .finally(() => setLoaded(true))
  }, [])

  return (
    <Grid className='text-center'>
      <Typography style={{ marginBottom: 8 }}>Import Videos</Typography>
      {loaded ? (
        !videos.length ? (
          <div className='text-center'>
            <Action label='Generate Metadata' callback={() => void generateApi.metadata()} />
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
                label={`Add Videos (page 1 of ${pages})`}
                callback={() =>
                  void videoApi.addVideos(videos).then(() => {
                    window.location.reload()
                  })
                }
              />
            </div>
          </>
        )
      ) : (
        <Spinner />
      )}
    </Grid>
  )
}

interface ActionProps {
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
