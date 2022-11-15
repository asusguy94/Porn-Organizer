import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { dateDiff, getDate } from '@utils/server/helper'
import { generateDate } from '@utils/server/generate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const videoRef = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) }
      })

      const video = await prisma.video.update({
        where: { id: parseInt(id) },
        data: { date: getDate(generateDate(videoRef.path)) },
        include: { star: true }
      })

      res.json({
        ...video,
        age: dateDiff(video.star?.birthdate, video.date)
      })
    }
  }

  res.status(400)
}
