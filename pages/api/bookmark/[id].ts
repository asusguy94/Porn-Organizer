import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { time, categoryID } = validate(
        z.object({
          time: z.number().int().min(1).optional(),
          categoryID: z.number().int().min(1).optional()
        }),
        req.body
      )

      if (time !== undefined) {
        await prisma.bookmark.update({
          where: { id: parseInt(id) },
          data: { start: time }
        })
      } else if (categoryID !== undefined) {
        // Change CategoryID
        await prisma.bookmark.update({
          where: { id: parseInt(id) },
          data: { category: { connect: { id: categoryID } } }
        })
      }

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.bookmark.delete({ where: { id: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}
