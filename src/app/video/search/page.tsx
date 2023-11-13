import Client from './client'

import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function VideoSearchPage() {
  const attributes = await db.attribute.findMany()
  const locations = await db.location.findMany()
  const categories = await db.category.findMany()
  const websites = await db.website.findMany()

  return <Client attributes={attributes} locations={locations} categories={categories} websites={websites} />
}
