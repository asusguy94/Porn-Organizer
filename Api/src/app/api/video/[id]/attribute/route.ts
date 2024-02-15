import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { attributeID } = validate(
    z.object({
      attributeID: z.number().int()
    }),
    await req.json()
  )

  return NextResponse.json(
    (
      await db.videoAttributes.create({
        data: { attributeID, videoID: id },
        include: { attribute: true }
      })
    ).attribute
  )
}
