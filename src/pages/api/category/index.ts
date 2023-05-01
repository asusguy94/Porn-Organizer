import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { Category } from '@interfaces/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse<Category[]>) {
  if (req.method === 'GET') {
    res.json(await prisma.category.findMany())
  } else if (req.method === 'POST') {
    const { name } = validate(
      z.object({
        name: z.string().min(3)
      }),
      req.body
    )

    await prisma.category.create({ data: { name } })

    res.end()
  }

  res.status(400)
}
