import { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { value } = validate(
        Joi.object({
          value: Joi.string().min(3).required()
        }),
        req.body
      )

      await prisma.attribute.update({ where: { id: parseInt(id) }, data: { name: value } })

      res.end()
    }
  }

  res.status(400)
}
