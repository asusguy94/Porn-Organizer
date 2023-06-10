import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { getStarData, getStarData2, getStarSlug } from '@utils/server/metadata'
import { printError } from '@utils/shared'
import { StarImages } from '@interfaces/api'

/*TODO
 *Get a star from the slug, slug is not null, and the star has at least 1 video
 *Get all the videos from a star
 *Filter out missing websites
 *Filter out videos with avaliable slugs.
 *Filter out videos older than the first video
 *display all the websites that are remaining
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      /* let star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
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
      } */

      const star = await prisma.star.findFirstOrThrow({
        where: { id: parseInt(id) },
        include: { videos: true }
      })
      if (star.api !== null) {
        const videos = star.videos.filter(v => v.apiDate !== null)
        if (videos.length > 0) {
          const data = await getStarData(star.api)

          res.json(data)
        }
      }

      res.end()
    }
  }

  res.status(400)
}
