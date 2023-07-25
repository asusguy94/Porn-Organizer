import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { locationID: locationId } = validate(
    z.object({
      locationID: z.number().int()
    }),
    await req.json()
  )

  return NextResponse.json(
    (
      await prisma.videoLocations.create({
        data: { locationID: locationId, videoID: id },
        include: { location: true }
      })
    ).location
  )
}
