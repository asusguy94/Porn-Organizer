import { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { attributeID } = validate(
        Joi.object({
          attributeID: Joi.number().integer().required()
        }),
        req.body
      )

      res.json(
        (
          await prisma.videoAttributes.create({
            data: { attributeID, videoID: parseInt(id) },
            include: { attribute: true }
          })
        ).attribute
      )
    }
  }

  res.status(400)
}
