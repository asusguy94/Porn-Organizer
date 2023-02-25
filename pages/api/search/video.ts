import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { dateDiff, getResizedThumb } from '@utils/server/helper'
import { getUnique } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (
        await prisma.video.findMany({
          include: {
            locations: { include: { location: true } },
            attributes: { include: { attribute: true } },
            bookmarks: { include: { category: true } },
            plays: true,
            website: true,
            site: true,
            star: true
          },
          orderBy: { name: 'asc' }
        })
      ).map(video => ({
        id: video.id,
        quality: video.height,
        date: video.apiDateHash === null || (video.api !== null && video.cover === null) ? null : video.date,
        name: video.name,
        image: video.cover ? getResizedThumb(video.id) : null,
        star: video.star?.name ?? null,
        ageInVideo: dateDiff(video.star?.birthdate, video.date),
        website: video.website?.name,
        site: video.site?.name ?? null,
        plays: video.plays.length,
        categories: getUnique(video.bookmarks.map(({ category }) => category.name)),
        attributes: video.attributes.map(({ attribute }) => attribute.name),
        locations: video.locations.map(({ location }) => location.name),
        api: video.api
      }))
    )
  }

  res.status(400)
}
