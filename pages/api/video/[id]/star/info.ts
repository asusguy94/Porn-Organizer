import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { getSceneData } from '@utils/server/metadata'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) }
      })

      if (video.api) {
        res.json(await getSceneData(video.api))
      }

      res.end()
    }
  }

  res.status(400)
}
