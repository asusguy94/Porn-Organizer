import { NextResponse } from 'next/server'

import { generateStarName } from '@utils/server/generate'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request) {
  const { name } = validate(
    z.object({
      name: z.string()
    }),
    await req.json()
  )

  return NextResponse.json(
    await db.star.create({
      data: { name }
    })
  )
}

export async function GET() {
  const stars = await db.star.findMany({
    select: { id: true, name: true, image: true },
    where: {
      OR: [
        { image: null },
        {
          // without profile data
          breast: null,
          haircolors: { none: {} },
          ethnicity: null,
          birthdate: null,
          height: null,
          weight: null
        },
        { autoTaggerIgnore: true },
        { api: null } // missing profile
      ]
    }
  })

  const missing = (await db.video.findMany({ where: { star: null } })).map(video => ({
    videoId: video.id,
    name: generateStarName(video.path)
  }))

  return NextResponse.json({ stars, missing })
}
