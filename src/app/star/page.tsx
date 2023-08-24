import Client from './client'

import { generateStarName } from '@utils/server/generate'
import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function StarsPage() {
  const stars = await prisma.star.findMany({
    select: { id: true, name: true, image: true },
    where: {
      OR: [
        { image: null },
        {
          // without profile data
          breast: null,
          haircolors: { none: {} },
          ethnicity: null,
          birthdate: null,
          height: null,
          weight: null
        },
        { autoTaggerIgnore: true },
        { api: null } // missing profile
      ]
    }
  })

  // VideoStars Without STAR
  const missing = (await prisma.video.findMany({ where: { star: null } })).map(video => ({
    videoId: video.id,
    name: generateStarName(video.path)
  }))

  return <Client stars={stars} missing={missing} />
}
