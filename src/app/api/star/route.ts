import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request) {
  const { name } = validate(
    z.object({
      name: z.string()
    }),
    await req.json()
  )

  return Response.json(
    await db.star.create({
      data: { name }
    })
  )
}
