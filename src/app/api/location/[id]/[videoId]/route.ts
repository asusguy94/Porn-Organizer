import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function DELETE(req: Request, { params }: Params<['id', 'videoId']>) {
  const { id, videoId } = validate(z.object({ id: z.coerce.number(), videoId: z.coerce.number() }), params)

  return Response.json(
    await db.videoLocations.delete({
      where: { locationID_videoID: { locationID: id, videoID: videoId } }
    })
  )
}
