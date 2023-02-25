import { NextApiRequest, NextApiResponse } from 'next/types'

import capitalize from 'capitalize'

import { prisma } from '@utils/server'
import { formatBreastSize, getDate } from '@utils/server/helper'
import { getStarData, getStarSlug } from '@utils/server/metadata'
import { printError } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      let star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
      if (!star.api) {
        star = await prisma.star.update({
          where: { id: parseInt(id) },
          data: { api: await getStarSlug(star.name) }
        })
      }

      if (star.api) {
        let update = false
        try {
          const starData = await getStarData(star.api)

          if (!star.birthdate && starData.birthdate) {
            star.birthdate = getDate(starData.birthdate)
            update = true
          }

          if (!star.ethnicity && starData.ethnicity) {
            star.ethnicity = capitalize(starData.ethnicity)
            update = true
          }

          if (!star.breast && starData.cupsize) {
            star.breast = formatBreastSize(starData.cupsize)
            update = true
          }

          if (!star.haircolor && starData.haircolor) {
            star.haircolor = capitalize(starData.haircolor)
            update = true
          }

          if (!star.height && starData.height) {
            star.height = starData.height
            update = true
          }

          if (!star.weight && starData.weight) {
            star.weight = starData.weight
            update = true
          }

          if (update) {
            res.json(await prisma.star.update({ where: { id: parseInt(id) }, data: star }))
          }

          res.end()
        } catch (error) {
          printError(error)
        }
      }
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.star.update({
        where: { id: parseInt(id) },
        data: {
          haircolor: null,
          breast: null,
          ethnicity: null,
          birthdate: null,
          height: null,
          weight: null,
          api: null
        }
      })

      res.end()
    }
  }

  res.status(400)
}
