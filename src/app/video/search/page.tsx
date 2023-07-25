import Client from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function VideoSearchPage() {
  const attributes = await prisma.attribute.findMany()
  const locations = await prisma.location.findMany()
  const categories = await prisma.category.findMany()
  const websites = await prisma.website.findMany()

  return <Client attributes={attributes} locations={locations} categories={categories} websites={websites} />
}
