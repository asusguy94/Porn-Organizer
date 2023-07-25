import { NextResponse } from 'next/server'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /star
export async function POST(req: Request) {
  const { name } = validate(
    z.object({
      name: z.string()
    }),
    await req.json()
  )

  return NextResponse.json(
    await prisma.star.create({
      data: { name }
    })
  )
}
