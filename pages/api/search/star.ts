import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { dateDiff } from '@utils/server/helper'
import { getUnique } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (
        await prisma.star.findMany({
          orderBy: { name: 'asc' },
          include: { videos: { include: { website: true, site: true } } }
        })
      ).map(star => ({
        id: star.id,
        name: star.name,
        image: star.image,
        breast: star.breast,
        haircolor: star.haircolor,
        ethnicity: star.ethnicity,
        age: dateDiff(star.birthdate),
        videoCount: star.videos.length,

        websites: getUnique(star.videos.map(({ website }) => website.name)),
        sites: getUnique(star.videos.flatMap(({ site }) => (site !== null ? [site.name] : [])))
      }))
    )
  }

  res.status(400)
}
