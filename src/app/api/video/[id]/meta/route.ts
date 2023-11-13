import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import findBroadSceneSlug from '@utils/server/metadata'
import { db } from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await db.video.findFirstOrThrow({
    where: { id },
    include: { website: true, site: true }
  })

  let result = await findBroadSceneSlug(video.name, video.website.name)
  if (video.site !== null) {
    result = [...result, ...(await findBroadSceneSlug(video.name, video.site.name))]
  }
  if (result.length === 0) {
    result = await findBroadSceneSlug(video.name)
  }

  return NextResponse.json(getUnique(result, 'id'))
}
