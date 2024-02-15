import Client from './client'

import { db } from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

export const dynamic = 'force-dynamic'

export default async function StarSearchPage() {
  const websites = await db.website.findMany({ orderBy: { name: 'asc' } })

  const breast = await db.star.findMany({
    select: { breast: true },
    where: { breast: { not: null } },
    orderBy: { breast: 'asc' }
  })

  const ethnicity = await db.star.findMany({
    select: { ethnicity: true },
    where: { ethnicity: { not: null } },
    orderBy: { ethnicity: 'asc' }
  })

  const haircolor = await db.haircolor.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  })

  return (
    <Client
      websites={websites}
      starInfo={{
        breast: getUnique(breast.flatMap(({ breast }) => (breast !== null ? [breast] : []))),
        ethnicity: getUnique(ethnicity.flatMap(({ ethnicity }) => (ethnicity !== null ? [ethnicity] : []))),
        haircolor: haircolor.map(haircolor => haircolor.name)
      }}
    />
  )
}
