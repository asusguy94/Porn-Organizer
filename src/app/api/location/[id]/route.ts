import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.number() }), params)

  const { name } = validate(
    z.object({
      name: z.string().min(3)
    }),
    await req.json()
  )

  return Response.json(
    await db.location.update({
      where: { id },
      data: { name }
    })
  )
}
