import { Params } from '@interfaces'
import { noExt, sendFile } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  return await sendFile(`./media/videos/${noExt(video.path)}/master.m3u8`)
}
