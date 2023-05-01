import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { Location } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse<Location>) {
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
