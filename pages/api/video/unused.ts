import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'

import { prisma } from '@utils/server'
import { fileExists } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const websites = (await prisma.website.findMany()).map(({ name }) => name)

    for await (const website of websites) {
      const fileDirs = (await fs.promises.readdir(`./media/videos/${website}`, { withFileTypes: true }))
        .filter(item => item.isDirectory())
        .map(item => item.name)

      for await (const fileDir of fileDirs) {
        if (!(await fileExists(`./media/videos/${website}/${fileDir}.mp4`))) {
          console.log({ website, file: fileDir })
        }
      }
    }

    res.end()
  }

  res.status(400)
}
