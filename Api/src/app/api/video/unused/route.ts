import fs from 'fs'

import { fileExists } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

//NEXT (used for debugging)
export async function GET() {
  const websites = (await db.website.findMany()).map(website => website.name)
  const videos = await db.video.findMany()

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

      if (videos.some(v => v.id !== id)) {
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

      if (videos.some(v => v.id !== id)) {
        console.log({ thumb })
      }
    }
  }
}
