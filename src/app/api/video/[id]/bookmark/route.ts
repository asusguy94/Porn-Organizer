import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { categoryID, time } = validate(
    z.object({
      categoryID: z.number().int().positive(),
      time: z.number().int().positive()
    }),
    await req.json()
  )

  return NextResponse.json(
    await db.bookmark.create({
      data: {
        video: { connect: { id } },
        category: { connect: { id: categoryID } },
        start: time
      }
    })
  )
}

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return NextResponse.json(
    await db.bookmark.deleteMany({
      where: { videoID: id }
    })
  )
}
