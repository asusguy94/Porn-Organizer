import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { dateDiff } from '@utils/server/helper'
import { aliasExists, getAliasAsStar } from '@utils/server/helper.db'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { name } = validate(
    z.object({
      name: z.string().min(2)
    }),
    await req.json()
  )

  const starID = (
    !(await aliasExists(name))
      ? await db.star.upsert({ where: { name }, update: {}, create: { name } })
      : await getAliasAsStar(name)
  ).id

  // Insert VIDEOSTAR into table
  const video = await db.video.update({
    where: { id },
    data: { star: { connect: { id: starID } } }
  })

  const star = await db.star.findFirstOrThrow({
    where: { id: starID },
    select: {
      id: true,
      name: true,
      image: true,
      birthdate: true,
      _count: { select: { videos: true } }
    }
  })

  const { birthdate, _count, ...rest } = star
  return NextResponse.json({
    ...rest,
    ageInVideo: video.starAge ?? dateDiff(birthdate, video.date),
    numVideos: _count.videos
  })
}

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return NextResponse.json(
    await db.video.update({
      where: { id },
      data: { star: { disconnect: true } }
    })
  )
}
