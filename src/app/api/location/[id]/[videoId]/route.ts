import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<['id', 'videoId']>) {
  const id = parseInt(params.id)
  const videoId = parseInt(params.videoId)

  return NextResponse.json(
    await db.videoLocations.delete({
      where: { locationID_videoID: { locationID: id, videoID: videoId } }
    })
  )
}
