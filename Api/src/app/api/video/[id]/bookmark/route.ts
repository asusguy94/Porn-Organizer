import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

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

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return NextResponse.json(
    await db.bookmark.deleteMany({
      where: { videoID: id }
    })
  )
}

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return NextResponse.json(
    await db.bookmark.findMany({
      select: {
        id: true,
        category: { select: { id: true, name: true } },
        start: true
      },
      where: { videoID: id },
      orderBy: { start: 'asc' }
    })
  )
}
