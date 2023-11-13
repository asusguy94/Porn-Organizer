import { NextResponse } from 'next/server'

import capitalize from 'capitalize'

import { Params } from '@interfaces'
import { formatBreastSize, getDate } from '@utils/server/helper'
import { getStarData, getStarSlug } from '@utils/server/metadata'
import { db } from '@utils/server/prisma'
import { printError } from '@utils/shared'

//NEXT /star/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  let star = await db.star.findFirstOrThrow({ where: { id } })
  if (!star.api) {
    star = await db.star.update({
      where: { id },
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

      if (!star.height && starData.height) {
        star.height = starData.height
        update = true
      }

      if (!star.weight && starData.weight) {
        star.weight = starData.weight
        update = true
      }

      if (update) {
        return NextResponse.json(
          await db.star.update({
            where: { id },
            data: star
          })
        )
      }
    } catch (error) {
      printError(error)
    }
  }
}

//NEXT /star/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  await db.starHaircolors.deleteMany({ where: { starId: id } })

  return NextResponse.json(
    await db.star.update({
      where: { id },
      data: {
        breast: null,
        ethnicity: null,
        birthdate: null,
        height: null,
        weight: null,
        api: null
      }
    })
  )
}
