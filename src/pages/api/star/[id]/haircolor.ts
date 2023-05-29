import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name, remove } = validate(
        z.object({
          name: z.string().min(3),
          remove: z.boolean().optional()
        }),
        req.body
      )

      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
      if (remove !== undefined) {
        await prisma.starHaircolors.delete({ where: { starId_hair: { starId: star.id, hair: name } } })
      } else {
        await prisma.starHaircolors.create({
          data: {
            star: { connect: { id: star.id } },
            haircolor: { connectOrCreate: { create: { name }, where: { name } } }
          }
        })
      }

      res.end()
    }
  }

  res.status(400)
}
