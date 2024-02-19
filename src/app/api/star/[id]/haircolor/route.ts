import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { name, remove } = validate(
    z.object({
      name: z.string().min(3),
      remove: z.boolean().optional()
    }),
    await req.json()
  )

  const star = await db.star.findFirstOrThrow({ where: { id } })
  if (remove !== undefined) {
    return Response.json(
      await db.starHaircolors.delete({
        where: { starId_hair: { starId: star.id, hair: name } }
      })
    )
  } else {
    return Response.json(
      await db.starHaircolors.create({
        data: {
          star: { connect: { id: star.id } },
          haircolor: { connectOrCreate: { create: { name }, where: { name } } }
        }
      })
    )
  }
}
