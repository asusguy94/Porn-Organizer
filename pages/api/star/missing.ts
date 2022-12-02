import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { generateStarName } from '@utils/server/generate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const stars = await prisma.star.findMany({
      select: { id: true, name: true, image: true },
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
          { autoTaggerIgnore: true }, // disabled profile
          { api: null } // missing profile
        ]
      }
    })

    // VideoStars Without STAR
    const missing = (await prisma.video.findMany({ where: { star: null } })).map(v => ({
      videoID: v.id,
      name: generateStarName(v.path)
    }))

    res.json({ stars, missing })
  }

  res.status(400)
}
