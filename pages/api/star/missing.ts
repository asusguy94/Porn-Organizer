import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { getUnique } from '@utils/server/helper'
import { generateStarName } from '@utils/server/generate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const stars = (
      await prisma.star.findMany({
        where: {
          OR: [
            { image: null }, // without image
            {
              // without profile data
              breast: null,
              haircolor: null,
              ethnicity: null,
              birthdate: null,
              height: null,
              weight: null
            },
            { autoTaggerIgnore: true } // disabled profile
          ]
        }
      })
    ).map(({ id, name, image }) => ({ id, name, image }))

    // VideoStars Without STAR
    // TODO should return only 1 video per star
    const missing = getUnique(await prisma.video.findMany({ include: { star: true } }))
      .filter(video => video.star === null)
      .map(video => ({
        videoID: video.id,
        name: generateStarName(video.path)
      }))

    res.json({ stars, missing })
  }

  res.status(400)
}
