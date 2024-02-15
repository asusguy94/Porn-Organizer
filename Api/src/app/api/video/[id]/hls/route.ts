import { Params } from '@interfaces'
import { noExt, sendFile } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  return await sendFile(`./media/videos/${noExt(video.path)}/master.m3u8`)
}
