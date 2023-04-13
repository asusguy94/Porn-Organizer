import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { getSceneData } from '@utils/server/metadata'
import { printError } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) }
      })

      if (video.api) {
        try {
          res.json(await getSceneData(video.api))
        } catch (error) {
          printError(error)
        }
      }

      res.end()
    }
  }

  res.status(400)
}
