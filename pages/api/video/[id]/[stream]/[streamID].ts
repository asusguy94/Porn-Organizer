import { NextApiRequest, NextApiResponse, PageConfig } from 'next/types'

import prisma from '@utils/server/prisma'
import { noExt, sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id, stream, streamID } = req.query

    if (typeof id === 'string' && typeof stream === 'string' && typeof streamID === 'string') {
      if (/^stream\d+$/.test(stream) && /^\d{4}\.ts$/.test(streamID)) {
        const video = await prisma.video.findFirstOrThrow({
          where: { id: parseInt(id) }
        })

        await sendFile(res, `./media/videos/${noExt(video.path)}/${stream}/${streamID}`)
      }
    }
  }

  res.status(400)
}

export const config: PageConfig = {
  api: { responseLimit: false }
}
