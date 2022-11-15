import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'

import { prisma } from '@utils/server'
import { dirOnly, extOnly } from '@utils/server/helper'
import { generateDate, generateSite, generateTitle } from '@utils/server/generate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const filesDB = await prisma.video.findMany()
    const filesArr = filesDB.map(({ path }) => path)

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
    res.json({
      files: newFilesSliced,
      pages: Math.ceil(newFiles.length / newFilesSliced.length) || 0
    })
  }

  res.status(400)
}
