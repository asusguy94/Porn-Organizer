import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useState } from 'react'

import fs from 'fs'

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
import prisma from '@utils/server/prisma'
import { dirOnly, extOnly } from '@utils/server/helper'
import { generateDate, generateSite, generateTitle } from '@utils/server/generate'

import styles from './add.module.scss'

type VideoFile = {
  path: string
  website: string
  site: string
  title: string
  date: string
}

export const getServerSideProps: GetServerSideProps<{ files: VideoFile[]; pages: number }> = async () => {
  const filesDB = await prisma.video.findMany()
  const filesArr = filesDB.map(({ path }) => path)

  // TODO skip this check if directory is missing?
  const paths = await fs.promises.readdir('./media/videos')

  const newFiles = []
  for await (const path of paths) {
    if (path.includes('_')) continue

    const dirPath = `./media/videos/${path}`
    if ((await fs.promises.lstat(dirPath)).isDirectory()) {
      const files = await fs.promises.readdir(dirPath)

      for await (const file of files) {
        const filePath = `${dirPath}/${file}`
        const dir = dirOnly(dirPath)
        if (
          !filesArr.includes(`${dir}/${file}`) &&
          (await fs.promises.lstat(filePath)).isFile() &&
          extOnly(filePath) === '.mp4' // Prevent random files from being imported!
        ) {
          newFiles.push({
            path: `${dir}/${file}`,
            website: dir,
            date: generateDate(filePath),
            site: generateSite(filePath),
            title: generateTitle(filePath)
          })
        }
      }
    }
  }

  const newFilesSliced = newFiles.slice(0, 33)

  return {
    props: {
      files: newFilesSliced,
      pages: Math.ceil(newFiles.length / newFilesSliced.length) || 0
    }
  }
}

const AddVideoPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ files: videos, pages }) => {
  const router = useRouter()

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
              label={`Add Videos (page 1 of ${pages})`}
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
