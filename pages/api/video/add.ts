import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import validate, { z } from '@utils/server/validation'
import { getDate } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { videos } = validate(
      z.object({
        videos: z.array(
          z.object({
            path: z.string(),
            website: z.string(),
            site: z.string(),
            title: z.string(),
            date: z.string()
          })
        )
      }),
      req.body
    )

    for await (const video of videos) {
      // Create WEBSITE if missing
      const website = await prisma.website.upsert({
        where: { name: video.website },
        create: { name: video.website },
        update: {}
      })

      const newVideo = await prisma.video.create({
        data: {
          path: video.path,
          name: video.title,
          date: getDate(video.date),
          website: { connect: { id: website.id } }
        },
        include: { site: true, website: true }
      })

      // Site should be used
      if (video.site.length) {
        // Create SITE if missing
        const site = await prisma.site.upsert({
          where: { name: video.site },
          create: { name: video.site, website: { connect: { id: website.id } } },
          update: {}
        })

        // Set SITE
        await prisma.video.update({
          where: { id: newVideo.id },
          data: { site: { connect: { id: site.id } } }
        })
      }
    }

    res.end()
  }

  res.status(400)
}
