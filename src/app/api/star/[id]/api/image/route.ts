import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { getStarData, getStarSlug } from '@utils/server/metadata'
import prisma from '@utils/server/prisma'
import { printError } from '@utils/shared'

//NEXT /star/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  let star = await prisma.star.findFirstOrThrow({ where: { id } })
  if (!star.api) {
    star = await prisma.star.update({
      where: { id },
      data: { api: await getStarSlug(star.name) }
    })
  }

  if (star.api) {
    try {
      const starData = await getStarData(star.api)
      return NextResponse.json({
        images: starData.posters
      })
    } catch (error) {
      printError(error)
    }

    // get a list of images that can be used!
    // return a list of images as url string[]
  }
}
