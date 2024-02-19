import { Params } from '@interfaces'
import { sendPartial } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  return await sendPartial(req, `./media/videos/${video.path}`)
}
