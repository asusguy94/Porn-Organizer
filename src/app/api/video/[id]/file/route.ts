import { Params } from '@interfaces'
import { sendPartial } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

//NEXT /star/[id], /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  return await sendPartial(req, `./media/videos/${video.path}`)
}
