import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { getSceneData } from '@utils/server/metadata'
import prisma from '@utils/server/prisma'
import { printError } from '@utils/shared'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await prisma.video.findFirstOrThrow({ where: { id } })
  if (video.api) {
    try {
      return NextResponse.json(await getSceneData(video.api))
    } catch (error) {
      printError(error)
    }
  }
}
