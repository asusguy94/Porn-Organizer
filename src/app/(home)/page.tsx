import Client, { HomePageProps } from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  type Props = HomePageProps['data'][number]

  let cols = 12
  const recent: Props = {
    cols,
    label: 'recent',
    videos: (
      await prisma.video.findMany({
        select: { id: true, name: true, cover: true },
        orderBy: { id: 'desc' },
        take: 1 * cols
      })
    ).map(({ cover, ...video }) => ({
      ...video,
      image: cover
    }))
  }

  cols = 12
  const newest: Props = {
    cols,
    label: 'newest',
    videos: (
      await prisma.video.findMany({
        select: { id: true, name: true, cover: true },
        orderBy: { date: 'desc' },
        take: 1 * cols
      })
    ).map(({ cover, ...video }) => ({
      ...video,
      image: cover
    }))
  }

  cols = 10
  const popular: Props = {
    cols,
    label: 'popular',
    videos: (
      await prisma.video.findMany({
        include: { plays: true },
        orderBy: [{ plays: { _count: 'desc' } }, { date: 'desc' }],
        take: 3 * cols
      })
    ).map(({ cover, plays, ...video }) => ({
      ...video,
      image: cover,
      total: plays.length
    }))
  }

  return <Client data={[recent, newest, popular]} />
}
