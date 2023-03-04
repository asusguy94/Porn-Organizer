import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { locationID } = validate(
        z.object({
          locationID: z.number().int()
        }),
        req.body
      )

      res.json(
        (
          await prisma.videoLocations.create({
            data: { locationID, videoID: parseInt(id) },
            include: { location: true }
          })
        ).location
      )
    }
  }

  res.status(400)
}
