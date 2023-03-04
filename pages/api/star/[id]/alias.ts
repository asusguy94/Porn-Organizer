import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import validate, { z } from '@utils/server/validation'
import { starExists } from '@utils/server/helper.db'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { alias } = validate(
        z.object({
          alias: z.string()
        }),
        req.body
      )

      if (!(await starExists(alias))) {
        await prisma.starAlias.create({ data: { star: { connect: { id: parseInt(id) } }, name: alias } })
      } else {
        throw new Error('Star already exists')
      }
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { alias } = validate(
        z.object({
          alias: z.string()
        }),
        req.body
      )

      await prisma.starAlias.findFirstOrThrow({ where: { starID: parseInt(id), name: alias } }).then(async alias => {
        await prisma.starAlias.delete({ where: { id: alias.id } })
      })

      res.end()
    }
  }

  res.status(400)
}
