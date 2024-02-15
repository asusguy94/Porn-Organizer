import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { generateDate } from '@utils/server/generate'
import { dateDiff, getDate } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const videoRef = await db.video.findFirstOrThrow({ where: { id } })

  const video = await db.video.update({
    where: { id },
    data: { date: getDate(generateDate(videoRef.path)) },
    include: { star: true }
  })

  return NextResponse.json({
    ...video,
    age: dateDiff(video.star?.birthdate, video.date)
  })
}
