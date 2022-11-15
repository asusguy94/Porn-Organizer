import { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { locationID } = validate(
        Joi.object({
          locationID: Joi.number().integer().required()
        }),
        req.body
      )

      res.json(
        (
          await prisma.videoLocations.create({
            data: { locationID, videoID: parseInt(id) },
            include: { location: true }
          })
        ).location
      )
    }
  }

  res.status(400)
}
