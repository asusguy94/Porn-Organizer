import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(
    await db.website.findMany({
      include: { _count: { select: { videos: true } } },
      orderBy: { name: 'asc' }
    })
  )
}
