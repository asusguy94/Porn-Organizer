import { dateDiff } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import { formatDate, getUnique } from '@utils/shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(
    (
      await db.video.findMany({
        select: {
          id: true,
          height: true,
          date: true,
          api: true,
          cover: true,
          name: true,
          star: { select: { name: true, birthdate: true } },
          website: { select: { name: true } },
          site: { select: { name: true } },
          plays: { select: { video: true } },
          bookmarks: { select: { category: { select: { name: true } } } },
          attributes: { select: { attribute: { select: { name: true } } } },
          locations: { select: { location: { select: { name: true } } } }
        },
        orderBy: { name: 'asc' }
      })
    ).map(({ height, cover, bookmarks, ...video }) => ({
      ...video,
      quality: height,
      date: formatDate(video.date),
      image: cover,
      star: video.star?.name ?? null,
      ageInVideo: dateDiff(video.star?.birthdate, video.date),
      website: video.website.name,
      site: video.site?.name ?? null,
      plays: video.plays.length,
      categories: getUnique(bookmarks.map(({ category }) => category.name)),
      attributes: video.attributes.map(({ attribute }) => attribute.name),
      locations: video.locations.map(({ location }) => location.name)
    }))
  )
}
