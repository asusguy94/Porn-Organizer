import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'
import Joi from 'joi'

import { prisma, validate } from '@utils/server'
import { downloader, sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })

      if (star.image !== null) {
        await sendFile(res, `./media/images/stars/${star.image}`)
      }
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { url } = validate(
        Joi.object({
          url: Joi.string().required()
        }),
        req.body
      )

      // Update Database
      const star = await prisma.star.update({ where: { id: parseInt(id) }, data: { image: `${id}.jpg` } })

      if (star.image !== null) {
        // Download Image
        await downloader(url, `media/images/stars/${star.image}`, 'URL')

        res.json({ image: star.image })
      }
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
      if (star.image !== null) {
        const path = `images/stars/${star.image}`

        await prisma.star.update({ where: { id: parseInt(id) }, data: { image: null } })

        fs.unlinkSync(`./media/${path}`)
      }

      res.end()
    }
  }

  res.status(400)
}
