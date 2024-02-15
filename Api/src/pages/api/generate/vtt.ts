import { NextApiRequest, NextApiResponse } from 'next/types'

import socket from '@utils/pusher/server'
import { extractVtt } from '@utils/server/ffmpeg'
import { fileExists } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import { getProgress } from '@utils/shared'

//NEXT /video/add
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await db.video.findMany({ where: { duration: { gt: 0 }, height: { gt: 0 }, width: { gt: 0 } } })
    socket.trigger('ffmpeg', 'vtt', { progress: 0 })

    let len = videos.length
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]

      const videoPath = `videos/${video.path}`
      const imagePath = `vtt/${video.id}.jpg`
      const vttPath = `vtt/${video.id}.vtt`

      const absoluteVideoPath = `./media/${videoPath}`
      const absoluteImagePath = `./media/${imagePath}`
      const absoluteVttPath = `./media/${vttPath}`

      const { progress } = getProgress(i, len)

      if (
        (await fileExists(absoluteVideoPath)) &&
        (!(await fileExists(absoluteVttPath)) || !(await fileExists(absoluteImagePath)))
      ) {
        socket.trigger('ffmpeg', 'vtt', { progress })

        // validate if video has invalid width
        try {
          await extractVtt(absoluteVideoPath, absoluteImagePath, video.id)
        } catch (error) {
          console.error(error)
        }
      } else {
        // item was skipped, so reduce count by 1
        len--
      }
    }
    socket.trigger('ffmpeg', 'vtt', { progress: 1 })

    res.end()
  }

  res.status(400)
}
