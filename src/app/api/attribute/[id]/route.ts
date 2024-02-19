import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { name } = validate(z.object({ name: z.string().min(3) }), await req.json())

  return Response.json(
    await db.attribute.update({
      where: { id: parseInt(params.id) },
      data: { name }
    })
  )
}
