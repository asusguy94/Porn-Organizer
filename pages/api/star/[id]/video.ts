import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { dateDiff } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      res.json(
        (
          await prisma.video.findMany({
            where: { starID: parseInt(id) },
            include: { star: true, website: true, site: true },
            orderBy: { date: 'asc' }
          })
        )
          .map(video => ({
            id: video.id,
            name: video.name,
            date: video.date,
            fname: video.path,
            website: video.website!.name,
            site: video.site?.name ?? null,
            age: video.starAge ?? dateDiff(video.star?.birthdate, video.date)
          }))
          .sort((a, b) => a.age - b.age)
      )
    }
  }

  res.status(400)
}
