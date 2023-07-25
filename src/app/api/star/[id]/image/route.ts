import { NextResponse } from 'next/server'

import fs from 'fs'

import { Params } from '@interfaces'
import { downloader, sendFile } from '@utils/server/helper'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /star, /star/[id], /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const star = await prisma.star.findFirstOrThrow({ where: { id } })
  if (star.image !== null) {
    return await sendFile(`./media/images/stars/${star.image}`)
  }
}

//NEXT /star/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { url } = validate(
    z.object({
      url: z.string().url()
    }),
    await req.json()
  )

  // Update Database
  const star = await prisma.star.update({ where: { id }, data: { image: `${id}.jpg` } })

  if (star.image !== null) {
    // Download Image
    await downloader(url, `media/images/stars/${star.image}`, 'URL')

    return NextResponse.json({
      image: star.image
    })
  }
}

//NEXT /star/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const star = await prisma.star.findFirstOrThrow({ where: { id } })
  if (star.image !== null) {
    const path = `images/stars/${star.image}`

    const result = await prisma.star.update({ where: { id }, data: { image: null } })
    fs.unlinkSync(`./media/${path}`)

    return NextResponse.json(result)
  }
}
