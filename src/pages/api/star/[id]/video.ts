import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { dateDiff } from '@utils/server/helper'
import { VideoStar } from '@interfaces/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse<VideoStar[]>) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      res.json(
        (
          await prisma.video.findMany({
            where: { starID: parseInt(id) },
            select: {
              id: true,
              name: true,
              date: true,
              path: true,
              starAge: true,
              star: { select: { birthdate: true } },
              website: { select: { name: true } },
              site: { select: { name: true } }
            },
            orderBy: { date: 'asc' }
          })
        )
          .map(({ path, website, site, starAge, star, ...video }) => ({
            ...video,
            fname: path,
            website: website.name,
            site: site?.name ?? null,
            age: starAge ?? dateDiff(star?.birthdate, video.date)
          }))
          .sort((a, b) => a.age - b.age)
      )
    }
  }

  res.status(400)
}
