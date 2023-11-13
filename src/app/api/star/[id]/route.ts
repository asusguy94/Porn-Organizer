import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { formatBreastSize, getDate, getSimilarStars } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { formatDate } from '@utils/shared'

//NEXT /star/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { name, slug, label, value, ignore } = validate(
    z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      label: z.string().optional(),
      value: z.string().optional(),
      ignore: z.boolean().optional()
    }),
    await req.json()
  )

  if (name !== undefined) {
    //TODO this @unique-field on name-column is not working?
    // seems to not rename, but also slow down performance on original table?
    return NextResponse.json(
      await db.star.update({
        where: { id },
        data: { name }
      })
    )
  } else if (slug !== undefined) {
    if (slug.length) {
      // add slug
      return NextResponse.json(
        await db.star.update({
          where: { id },
          data: { api: slug }
        })
      )
    } else {
      // reset slug
      return NextResponse.json(
        await db.star.update({
          where: { id },
          data: { api: null }
        })
      )
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
      await db.star.update({ where: { id }, data: { [label]: null } })
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

      await db.star.update({ where: { id }, data: { [label]: data } })
    }

    return NextResponse.json({
      reload,
      content: data,
      similar: await getSimilarStars(id)
    })
  } else if (ignore !== undefined) {
    return NextResponse.json(
      await db.star.update({
        where: { id },
        data: { autoTaggerIgnore: ignore }
      })
    )
  }
}

//NEXT /star/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return NextResponse.json(
    await db.star.delete({
      where: { id }
    })
  )
}
