import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { dateDiff } from '@utils/server/helper'
import { aliasExists, getAliasAsStar } from '@utils/server/helper.db'

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      if (id === '0') {
        res.end()
        return
      }

      const star = await prisma.star.findFirst({
        where: { videos: { some: { id: parseInt(id) } } },
        select: { id: true, name: true, image: true, birthdate: true }
      })

      if (star !== null) {
        const videos = await prisma.video.findMany({
          where: { starID: star.id }
        })

        const { birthdate, ...rest } = star
        res.json({
          ...rest,
          ageInVideo: dateDiff(videos.find(v => v.id === parseInt(id))?.date, birthdate),
          numVideos: videos.length
        })
      } else {
        res.json(null)
      }

      res.end()
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name } = validate(
        z.object({
          name: z.string().min(2)
        }),
        req.body
      )

      const starID = (
        !(await aliasExists(name))
          ? await prisma.star.upsert({ where: { name }, update: {}, create: { name } })
          : await getAliasAsStar(name)
      ).id

      // Insert VIDEOSTAR into table
      const video = await prisma.video.update({
        where: { id: parseInt(id) },
        data: { star: { connect: { id: starID } } }
      })

      const star = await prisma.star.findFirstOrThrow({
        where: { id: starID },
        select: {
          id: true,
          name: true,
          image: true,
          birthdate: true,
          _count: { select: { videos: true } }
        }
      })

      const { birthdate, _count, ...rest } = star
      res.json({
        ...rest,
        ageInVideo: video.starAge ?? dateDiff(birthdate, video.date),
        numVideos: _count.videos
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
