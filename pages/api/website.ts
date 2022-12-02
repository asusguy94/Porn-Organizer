import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (
        await prisma.website.findMany({
          include: { sites: true, _count: { select: { videos: true } } },
          orderBy: { name: 'asc' }
        })
      ).map(w => ({ id: w.id, name: w.name, sites: w.sites, videos: w._count.videos }))
    )
  }

  res.status(400)
}
