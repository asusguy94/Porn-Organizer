import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'
import { getDate } from '@utils/server/helper'
import { websiteExists } from '@utils/server/helper.db'

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
      const newVideo = await prisma.video.create({
        data: {
          path: video.path,
          name: video.title,
          date: getDate(video.date)
        },
        include: { site: true, website: true }
      })

      // Create WEBSITE if missing
      if (!(await websiteExists(video.website))) {
        // Create WEBSITE
        await prisma.website.create({ data: { name: video.website } })
      }
      const website = await prisma.website.findFirstOrThrow({
        where: { name: video.website }
      })

      // Site should be used
      if (video.site.length) {
        // Create SITE if missing
        if ((await prisma.site.findFirst({ where: { name: video.site } })) === null) {
          // Create SITE
          await prisma.site.create({
            data: {
              name: video.site,
              website: { connect: { id: website.id } }
            }
          })
        }
        const site = await prisma.site.findFirstOrThrow({
          where: { name: video.site }
        })

        // Set SITE
        await prisma.video.update({
          where: { id: newVideo.id },
          data: { site: { connect: { id: site.id } } }
        })
      }

      // Set WEBSITE
      await prisma.video.update({
        where: { id: newVideo.id },
        data: { website: { connect: { id: website.id } } }
      })
    }

    res.end()
  }

  res.status(400)
}
