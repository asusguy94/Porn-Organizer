import { Params, VideoStar } from '@interfaces'
import { dateDiff } from '@utils/server/helper'
import { aliasExists, getAliasAsStar } from '@utils/server/helper.db'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const star = await db.star.findFirst({
    where: { videos: { some: { id } } },
    select: { id: true, name: true, image: true, birthdate: true }
  })

  let starVal: VideoStar | null = null
  if (star !== null) {
    const videos = await db.video.findMany({
      where: { starID: star.id }
    })

    const { birthdate, ...rest } = star
    starVal = {
      ...rest,
      ageInVideo: dateDiff(videos.find(v => v.id === id)?.date, birthdate),
      numVideos: videos.length
    }
  }

  return Response.json(starVal)
}

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

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
  return Response.json({
    ...rest,
    ageInVideo: video.starAge ?? dateDiff(birthdate, video.date),
    numVideos: _count.videos
  })
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.video.update({
      where: { id },
      data: { star: { disconnect: true } }
    })
  )
}
