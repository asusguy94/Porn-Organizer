import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { time, categoryID } = validate(
    z.object({
      time: z.number().int().positive().optional(),
      categoryID: z.number().int().positive().optional()
    }),
    await req.json()
  )

  if (time !== undefined) {
    return NextResponse.json(
      await prisma.bookmark.update({
        where: { id },
        data: { start: time }
      })
    )
  } else if (categoryID !== undefined) {
    // Change CategoryID
    return NextResponse.json(
      await prisma.bookmark.update({
        where: { id },
        data: { category: { connect: { id: categoryID } } }
      })
    )
  }
}

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return NextResponse.json(
    await prisma.bookmark.delete({
      where: { id }
    })
  )
}
