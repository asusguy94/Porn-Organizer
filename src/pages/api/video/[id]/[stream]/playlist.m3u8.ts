import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { noExt, sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id, stream } = req.query

    if (typeof id === 'string' && typeof stream === 'string') {
      const video = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) }
      })

      await sendFile(res, `./media/videos/${noExt(video.path)}/${stream}/playlist.m3u8`)
    }
  }

  res.status(400)
}
