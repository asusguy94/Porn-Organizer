import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export const dynamic = 'force-dynamic'

export async function GET(req: Request, { params }: Params<['label', 'limit']>) {
  const { label, limit } = validate(
    z.object({
      label: z.enum(['recent', 'newest', 'popular']),
      limit: z.coerce.number().int().min(1)
    }),
    params
  )

  switch (label) {
    case 'recent':
      return Response.json(
        (
          await db.video.findMany({
            select: { id: true, name: true, cover: true },
            orderBy: { id: 'desc' },
            take: limit
          })
        ).map(({ cover, ...video }) => ({
          ...video,
          image: cover
        }))
      )
    case 'newest':
      return Response.json(
        (
          await db.video.findMany({
            select: { id: true, name: true, cover: true },
            orderBy: { date: 'desc' },
            take: limit
          })
        ).map(({ cover, ...video }) => ({
          ...video,
          image: cover
        }))
      )
    case 'popular':
      return Response.json(
        (
          await db.video.findMany({
            include: { plays: true },
            orderBy: [{ plays: { _count: 'desc' } }, { date: 'desc' }],
            take: limit
          })
        ).map(({ cover, plays, ...video }) => ({
          ...video,
          image: cover,
          total: plays.length
        }))
      )
  }
}
