import Client from './client'

import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const websites = await db.website.findMany({
    include: { _count: { select: { videos: true } } },
    orderBy: { name: 'asc' }
  })

  return <Client websites={websites} />
}
