import { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'
import { dateDiff } from '@utils/server/helper'
import { aliasExists, getAliasAsStar } from '@utils/server/helper.db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const star = await prisma.star.findFirst({
        where: { videos: { some: { id: parseInt(id) } } }
      })

      if (star !== null) {
        const videos = await prisma.video.findMany({
          where: { starID: star.id }
        })

        res.json({
          id: star.id,
          name: star.name,
          image: star.image,
          ageInVideo: dateDiff(videos.find(v => v.id === parseInt(id))?.date, star.birthdate),
          numVideos: videos.length
        })
      }

      res.end() // same as return null
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name } = validate(
        Joi.object({
          name: Joi.string().min(2).required()
        }),
        req.body
      )

      let starID
      if (!(await aliasExists(name))) {
        starID = (
          await prisma.star.upsert({
            where: { name },
            update: {},
            create: { name }
          })
        ).id
      } else {
        starID = (await getAliasAsStar(name)).id
      }

      // Insert VIDEOSTAR into table
      await prisma.video.update({
        where: { id: parseInt(id) },
        data: { star: { connect: { id: starID } } }
      })

      const video = await prisma.video.findFirstOrThrow({
        where: { starID },
        include: { star: true }
      })
      res.json({
        id: video.star?.id,
        name: video.star?.name,
        image: video.star?.image ?? null,
        ageInVideo: video.starAge ?? dateDiff(video.star?.birthdate, video.date)
      })
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.video.update({
        where: { id: parseInt(id) },
        data: { star: { disconnect: true } }
      })

      res.end()
    }
  }

  res.status(400)
}
