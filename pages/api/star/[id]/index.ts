import { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'
import { formatBreastSize, formatDate, getDate, getSimilarStars } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })

      res.json({
        id: star.id,
        name: star.name,
        image: star.image,
        ignored: star.autoTaggerIgnore,
        info: {
          breast: star.breast ?? '',
          haircolor: star.haircolor ?? '',
          ethnicity: star.ethnicity ?? '',
          // items without autocomplete
          birthdate: star.birthdate ? formatDate(star.birthdate, true) : '',
          height: star.height?.toString() ?? '',
          weight: star.weight?.toString() ?? ''
        },
        similar: await getSimilarStars(star.id)
      })
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name, slug, label, value, ignore } = validate(
        Joi.object({
          name: Joi.string(),
          slug: Joi.string().allow(''),
          label: Joi.string(),
          value: Joi.string().allow(''),
          ignore: Joi.boolean()
        })
          .with('label', 'value')
          .xor('name', 'label', 'ignore', 'slug'),
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
      } else if (label !== undefined) {
        // TODO make code more readable
        // reusing multiple variables
        // some are not necessary
        // some are being checked in reactJS

        let data = value

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
