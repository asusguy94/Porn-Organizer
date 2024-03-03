import { Params } from '@interfaces'
import { dateDiff } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { formatDate } from '@utils/shared'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const videos = await db.video.findMany({
    where: { starID: id },
    select: {
      id: true,
      name: true,
      date: true,
      path: true,
      starAge: true,
      cover: true,
      star: { select: { birthdate: true } },
      website: { select: { name: true } },
      site: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  })

  return Response.json(
    videos
      .map(({ path, website, site, starAge, star, cover, ...video }) => ({
        ...video,
        date: formatDate(video.date),
        fname: path,
        website: website.name,
        site: site?.name ?? null,
        age: starAge ?? dateDiff(star?.birthdate, video.date),
        image: cover ?? '',
        hidden: false
      }))
      .sort((a, b) => a.age - b.age)
  )
}
