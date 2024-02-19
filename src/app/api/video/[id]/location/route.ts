import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { locationID: locationId } = validate(
    z.object({
      locationID: z.number().int()
    }),
    await req.json()
  )

  return Response.json(
    (
      await db.videoLocations.create({
        data: { locationID: locationId, videoID: id },
        include: { location: true }
      })
    ).location
  )
}
