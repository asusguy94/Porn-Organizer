import { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'
import { getUnique } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json({
      breast: getUnique(
        (await prisma.star.findMany({ where: { breast: { not: null } }, orderBy: { breast: 'asc' } })).map(
          ({ breast }) => breast!
        )
      ),
      haircolor: getUnique(
        (await prisma.star.findMany({ where: { haircolor: { not: null } }, orderBy: { haircolor: 'asc' } })).map(
          ({ haircolor }) => haircolor!
        )
      ),
      ethnicity: getUnique(
        (await prisma.star.findMany({ where: { ethnicity: { not: null } }, orderBy: { ethnicity: 'asc' } })).map(
          ({ ethnicity }) => ethnicity!
        )
      ),
      websites: (await prisma.website.findMany({ orderBy: { name: 'asc' } })).map(website => website.name)
    })
  } else if (req.method === 'POST') {
    const { name } = validate(
      Joi.object({
        name: Joi.string().required()
      }),
      req.body
    )

    await prisma.star.create({ data: { name } })

    res.end()
  }

  res.status(400)
}
