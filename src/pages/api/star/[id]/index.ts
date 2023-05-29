import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { formatBreastSize, getDate, getSimilarStars } from '@utils/server/helper'
import { formatDate } from '@utils/shared'
import { PutStar, RawStar } from '@interfaces/api'

export default async function handler(req: NextApiRequest, res: NextApiResponse<PutStar | RawStar>) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name, slug, label, value, ignore } = validate(
        z.object({
          name: z.string().optional(),
          slug: z.string().optional(),
          label: z.string().optional(),
          value: z.string().optional(),
          ignore: z.boolean().optional()
        }),

        req.body
      )

      if (name !== undefined) {
        //TODO this @unique-field on name-column is not working?
        // seems to not rename, but also slow down performance on original table?
        await prisma.star.update({ where: { id: parseInt(id) }, data: { name } })
      } else if (slug !== undefined) {
        if (slug.length) {
          // add slug
          await prisma.star.update({ where: { id: parseInt(id) }, data: { api: slug } })
        } else {
          // reset slug
          await prisma.star.update({ where: { id: parseInt(id) }, data: { api: null } })
        }
      } else if (label !== undefined && value !== undefined) {
        // TODO make code more readable
        // reusing multiple variables
        // some are not necessary
        // some are being checked in reactJS

        let data: string | Date | number | null = value

        // ALWAYS refresh page when changing AGE!
        let reload = label === 'birthdate'

        if (!data.length) {
          data = null
          await prisma.star.update({ where: { id: parseInt(id) }, data: { [label]: null } })
        } else {
          const valueRef = data

          switch (label) {
            case 'breast':
              data = formatBreastSize(data)
              reload = valueRef !== data
              break
            case 'birthdate':
              // TODO date is subtracted by 1 day!, function might need an additional argument?
              // works if "YYYY-MM-DD" is supplied
              // doees not work if "D MMMM YYYY" is supplied
              data = getDate(formatDate(data, true))
              break
            case 'height':
            case 'weight':
              data = parseInt(data)
              break
            default:
              data = valueRef
          }

          await prisma.star.update({ where: { id: parseInt(id) }, data: { [label]: data } })
        }

        res.json({
          reload,
          content: data,
          similar: await getSimilarStars(parseInt(id))
        })
      } else if (ignore !== undefined) {
        res.json(
          await prisma.star.update({
            where: { id: parseInt(id) },
            data: { autoTaggerIgnore: ignore }
          })
        )
      }

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.star.delete({ where: { id: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}
