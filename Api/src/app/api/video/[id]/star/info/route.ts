import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { getSceneData } from '@utils/server/metadata'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { printError } from '@utils/shared'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const video = await db.video.findFirstOrThrow({ where: { id } })
  if (video.api) {
    try {
      return NextResponse.json(await getSceneData(video.api))
    } catch (error) {
      printError(error)
    }
  }
}
