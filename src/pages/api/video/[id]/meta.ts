import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'

import { findBroadSceneSlug } from '@utils/server/metadata'
import { getUnique } from '@utils/shared'
import { BroadSceneSlug } from '@interfaces/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse<BroadSceneSlug[]>) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) },
        include: { website: true, site: true }
      })

      let result = await findBroadSceneSlug(video.name, video.website.name)
      if (video.site !== null) {
        result = [...result, ...(await findBroadSceneSlug(video.name, video.site.name))]
      }
      if (result.length === 0) {
        result = await findBroadSceneSlug(video.name)
      }

      res.json(getUnique(result, 'id'))

      res.end()
    }
  }
  res.status(400)
}
