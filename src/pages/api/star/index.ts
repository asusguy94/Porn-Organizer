import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { getUnique } from '@utils/shared'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<{ breast: string[]; haircolor: string[]; ethnicity: string[]; websites: string[] }>
) {
  if (req.method === 'GET') {
    res.json({
      breast: getUnique(
        (
          await prisma.star.findMany({
            where: { breast: { not: null } },
            orderBy: { breast: 'asc' }
          })
        ).flatMap(({ breast }) => (breast !== null ? [breast] : []))
      ),
      haircolor: getUnique(
        (
          await prisma.star.findMany({
            where: { haircolor: { not: null } },
            orderBy: { haircolor: 'asc' }
          })
        ).flatMap(({ haircolor }) => (haircolor !== null ? [haircolor] : []))
      ),
      ethnicity: getUnique(
        (
          await prisma.star.findMany({
            where: { ethnicity: { not: null } },
            orderBy: { ethnicity: 'asc' }
          })
        ).flatMap(({ ethnicity }) => (ethnicity !== null ? [ethnicity] : []))
      ),
      websites: (await prisma.website.findMany({ orderBy: { name: 'asc' } })).map(website => website.name)
    })
  } else if (req.method === 'POST') {
    const { name } = validate(
      z.object({
        name: z.string()
      }),
      req.body
    )

    await prisma.star.create({ data: { name } })

    res.end()
  }

  res.status(400)
}
