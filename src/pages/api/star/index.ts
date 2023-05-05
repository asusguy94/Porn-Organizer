import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
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
