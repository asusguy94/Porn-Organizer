import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      res.json(
        await prisma.bookmark.findMany({
          select: {
            id: true,
            category: { select: { id: true, name: true } },
            start: true
          },
          where: { videoID: parseInt(id) },
          orderBy: { start: 'asc' }
        })
      )
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { categoryID, time } = validate(
        z.object({
          categoryID: z.number().int().min(1),
          time: z.number().int().min(1)
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
