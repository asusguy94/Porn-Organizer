import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /star/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { name, remove } = validate(
    z.object({
      name: z.string().min(3),
      remove: z.boolean().optional()
    }),
    await req.json()
  )

  const star = await prisma.star.findFirstOrThrow({ where: { id } })
  if (remove !== undefined) {
    return NextResponse.json(
      await prisma.starHaircolors.delete({
        where: { starId_hair: { starId: star.id, hair: name } }
      })
    )
  } else {
    return NextResponse.json(
      await prisma.starHaircolors.create({
        data: {
          star: { connect: { id: star.id } },
          haircolor: { connectOrCreate: { create: { name }, where: { name } } }
        }
      })
    )
  }
}
