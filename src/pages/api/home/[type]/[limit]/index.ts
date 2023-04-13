import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { type, limit } = req.query

    if (typeof type === 'string' && typeof limit === 'string') {
      switch (type) {
        case 'recent':
          res.json(
            (
              await prisma.video.findMany({
                select: { id: true, name: true, cover: true },
                orderBy: { id: 'desc' },
                take: parseInt(limit)
              })
            ).map(({ cover, ...video }) => ({
              ...video,
              image: cover
            }))
          )
          break

        case 'newest':
          res.json(
            (
              await prisma.video.findMany({
                select: { id: true, name: true, cover: true },
                orderBy: { date: 'desc' },
                take: parseInt(limit)
              })
            ).map(({ cover, ...video }) => ({
              ...video,
              image: cover
            }))
          )
          break

        case 'popular':
          res.json(
            (
              await prisma.video.findMany({
                include: { plays: true },
                orderBy: [{ plays: { _count: 'desc' } }, { date: 'desc' }],
                take: parseInt(limit)
              })
            ).map(({ cover, plays, ...video }) => ({
              ...video,
              total: plays.length,
              image: cover
            }))
          )
          break

        default:
          throw new Error(`/${type} is undefined`)
      }
    }
  }

  res.status(400)
}
