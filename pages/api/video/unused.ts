import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'

import { prisma } from '@utils/server'
import { fileExists } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const websites = (await prisma.website.findMany()).map(({ name }) => name)
    const videos = await prisma.video.findMany()

    // checks for unused video-files
    for await (const website of websites) {
      const fileDirs = (await fs.promises.readdir(`./media/videos/${website}`, { withFileTypes: true }))
        .filter(item => item.isDirectory())
        .map(item => item.name)

      for await (const fileDir of fileDirs) {
        if (!(await fileExists(`./media/videos/${website}/${fileDir}.mp4`))) {
          console.log({ website, file: fileDir })
        }
      }
    }

    // checks for unused video-images
    const images = await fs.promises.readdir('./media/images/videos')
    for await (const image of images) {
      const pattern = image.match(/^\d+\./)
      if (pattern !== null) {
        const id = parseInt(pattern[0])

        if (videos.find(v => v.id === id) === undefined) {
          console.log({ image })
        }
      }
    }

    // checks for unused thumbnails
    const thumbs = await fs.promises.readdir('./media/vtt')
    for await (const thumb of thumbs) {
      const pattern = thumb.match(/^\d+\./)
      if (pattern !== null) {
        const id = parseInt(pattern[0])

        if (videos.find(v => v.id === id) === undefined) {
          console.log({ thumb })
        }
      }
    }

    res.end()
  }

  res.status(400)
}
