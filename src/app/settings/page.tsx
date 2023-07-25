import Client from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

const SettingsPage = async () => {
  const websites = await prisma.website.findMany({
    include: { _count: { select: { videos: true } } },
    orderBy: { name: 'asc' }
  })

  return <Client websites={websites} />
}

export default SettingsPage
