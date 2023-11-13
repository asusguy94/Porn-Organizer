import fs from 'fs'

import Client, { File } from './client'

import { generateDate, generateSite, generateTitle } from '@utils/server/generate'
import { dirOnly, extOnly } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function AddVideoPage() {
  const filesDB = await db.video.findMany()
  const filesArr = filesDB.map(video => video.path)

  // TODO skip this check if directory is missing?
  const paths = await fs.promises.readdir('./media/videos')

  const newFiles: File[] = []
  for await (const path of paths) {
    if (path.includes('_')) continue

    const dirPath = `./media/videos/${path}`
    if ((await fs.promises.lstat(dirPath)).isDirectory()) {
      try {
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
      } catch {
        console.log(`"${dirPath}" is not readable, skipping`)
      }
    }
  }

  const newFilesSliced = newFiles.slice(0, 33)

  return <Client files={newFilesSliced} pages={Math.ceil(newFiles.length / newFilesSliced.length) || 0} />
}
