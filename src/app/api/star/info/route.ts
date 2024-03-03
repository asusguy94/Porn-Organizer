import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const breast = await db.star.groupBy({
    by: ['breast'],
    where: { breast: { not: null } },
    orderBy: { breast: 'asc' }
  })

  const ethnicity = await db.star.groupBy({
    by: ['ethnicity'],
    where: { ethnicity: { not: null } },
    orderBy: { ethnicity: 'asc' }
  })

  const haircolor = await db.haircolor.findMany({
    select: { name: true },
    orderBy: { name: 'asc' }
  })

  return Response.json({
    breast: breast.map(({ breast }) => breast),
    ethnicity: ethnicity.map(({ ethnicity }) => ethnicity),
    haircolor: haircolor.map(haircolor => haircolor.name)
  })
}
