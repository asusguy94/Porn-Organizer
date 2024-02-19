import type { Video } from '@prisma/client'
import { getDate } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request) {
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
    await req.json()
  )

  const result: Video[] = []
  for await (const video of videos) {
    // Create WEBSITE if missing
    const website = await db.website.upsert({
      where: { name: video.website },
      create: { name: video.website },
      update: {}
    })

    const newVideo = await db.video.create({
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
      const site = await db.site.upsert({
        where: { name: video.site },
        create: { name: video.site, website: { connect: { id: website.id } } },
        update: {}
      })

      // Set SITE
      result.push(
        await db.video.update({
          where: { id: newVideo.id },
          data: { site: { connect: { id: site.id } } }
        })
      )
    }
  }

  return Response.json(result)
}
