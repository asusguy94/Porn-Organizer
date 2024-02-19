import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { time, categoryID } = validate(
    z.object({
      time: z.number().int().positive().optional(),
      categoryID: z.number().int().positive().optional()
    }),
    await req.json()
  )

  if (time !== undefined) {
    return Response.json(
      await db.bookmark.update({
        where: { id },
        data: { start: time }
      })
    )
  } else if (categoryID !== undefined) {
    // Change CategoryID
    return Response.json(
      await db.bookmark.update({
        where: { id },
        data: { category: { connect: { id: categoryID } } }
      })
    )
  }
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.bookmark.delete({
      where: { id }
    })
  )
}
