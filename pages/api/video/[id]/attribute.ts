import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { attributeID } = validate(
        z.object({
          attributeID: z.number().int()
        }),
        req.body
      )

      res.json(
        (
          await prisma.videoAttributes.create({
            data: { attributeID, videoID: parseInt(id) },
            include: { attribute: true }
          })
        ).attribute
      )
    }
  }

  res.status(400)
}
