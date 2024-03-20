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

import { createFileRoute } from '@tanstack/react-router'

import Spinner from '@/components/spinner'

import { generateService, videoService } from '@/service'

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
