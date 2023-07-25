import Client from './client'

import { generateStarName } from '@utils/server/generate'
import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

const StarsPage = async () => {
  const stars = await prisma.star.findMany({
    select: { id: true, name: true, image: true },
    where: {
      OR: [
        { image: null }, // without image
        {
          // without profile data
          breast: null,
          haircolors: { none: {} },
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
  const missing = (await prisma.video.findMany({ where: { star: null } })).map(video => ({
    videoId: video.id,
    name: generateStarName(video.path)
  }))

  return <Client stars={stars} missing={missing} />
}

export default StarsPage
