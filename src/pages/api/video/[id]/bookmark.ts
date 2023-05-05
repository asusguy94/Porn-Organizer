import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { Bookmark } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse<Bookmark>) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { categoryID, time } = validate(
        z.object({
          categoryID: z.number().int().positive(),
          time: z.number().int().positive()
        }),
        req.body
      )

      res.json(
        await prisma.bookmark.create({
          data: {
            video: { connect: { id: parseInt(id) } },
            category: { connect: { id: categoryID } },
            start: time
          }
        })
      )
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.bookmark.deleteMany({ where: { videoID: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}
