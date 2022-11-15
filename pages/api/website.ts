import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(await prisma.website.findMany({ include: { sites: true }, orderBy: { name: 'asc' } }))
  }

  res.status(400)
}
