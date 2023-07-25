import { NextApiRequest, NextApiResponse } from 'next/types'

import { extractVtt } from '@utils/server/ffmpeg'
import { fileExists, logger } from '@utils/server/helper'
import prisma from '@utils/server/prisma'

//NEXT /video/add
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await prisma.video.findMany({ where: { duration: { gt: 0 }, height: { gt: 0 }, width: { gt: 0 } } })

    logger('Generating VTT')
    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const imagePath = `vtt/${video.id}.jpg`
      const vttPath = `vtt/${video.id}.vtt`

      const absoluteVideoPath = `./media/${videoPath}`
      const absoluteImagePath = `./media/${imagePath}`
      const absoluteVttPath = `./media/${vttPath}`

      if (
        (await fileExists(absoluteVideoPath)) &&
        (!(await fileExists(absoluteVttPath)) || !(await fileExists(absoluteImagePath)))
      ) {
        logger(`Generating VTT: ${video.id}`)

        // validate if video has invalid width
        try {
          await extractVtt(absoluteVideoPath, absoluteImagePath, video.id)
        } catch (error) {
          logger(`Cannot generate VTT for ${video.id}`)
          console.error(error)
        }
      }
    }
    logger('Finished Generating VTT')

    res.end()
  }

  res.status(400)
}
