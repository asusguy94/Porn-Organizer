import Client from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const websites = await prisma.website.findMany({
    include: { _count: { select: { videos: true } } },
    orderBy: { name: 'asc' }
  })

  return <Client websites={websites} />
}
