import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { getStarData, getStarSlug } from '@utils/server/metadata'
import { printError } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      let star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
      if (!star.api) {
        star = await prisma.star.update({
          where: { id: parseInt(id) },
          data: { api: await getStarSlug(star.name) }
        })
      }

      if (star.api) {
        try {
          const starData = await getStarData(star.api)
          res.json({ images: starData.posters })
        } catch (error) {
          printError(error)
        }

        // get a list of images that can be used!
        // return a list of images as url string[]
      }

      res.end()
    }
  }

  res.status(400)
}
