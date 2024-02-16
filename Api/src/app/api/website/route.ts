import { NextResponse } from 'next/server'

import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const websites = await db.website.findMany({
    include: { _count: { select: { videos: true } } },
    orderBy: { name: 'asc' }
  })

  return NextResponse.json(websites)
}
