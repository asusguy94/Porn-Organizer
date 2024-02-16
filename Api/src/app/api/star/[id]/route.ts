import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { dateDiff, formatBreastSize, getDate, getSimilarStars } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { formatDate } from '@utils/shared'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { name, slug, label, value, ignore } = validate(
    z.object({
      name: z.string().optional(),
      slug: z.string().optional(),
      label: z.string().optional(),
      value: z.string().optional(),
      ignore: z.boolean().optional()
    }),
    await req.json()
  )

  if (name !== undefined) {
    //TODO this @unique-field on name-column is not working?
    // seems to not rename, but also slow down performance on original table?
    return NextResponse.json(
      await db.star.update({
        where: { id },
        data: { name }
      })
    )
  } else if (slug !== undefined) {
    if (slug.length) {
      // add slug
      return NextResponse.json(
        await db.star.update({
          where: { id },
          data: { api: slug }
        })
      )
    } else {
      // reset slug
      return NextResponse.json(
        await db.star.update({
          where: { id },
          data: { api: null }
        })
      )
    }
  } else if (label !== undefined && value !== undefined) {
    // TODO make code more readable
    // reusing multiple variables
    // some are not necessary
    // some are being checked in reactJS

    let data: string | Date | number | null = value

    // ALWAYS refresh page when changing AGE!
    let reload = label === 'birthdate'

    if (!data.length) {
      data = null
      await db.star.update({ where: { id }, data: { [label]: null } })
    } else {
      const valueRef = data

      switch (label) {
        case 'breast':
          data = formatBreastSize(data)
          reload = valueRef !== data
          break
        case 'birthdate':
          // TODO date is subtracted by 1 day!, function might need an additional argument?
          // works if "YYYY-MM-DD" is supplied
          // doees not work if "D MMMM YYYY" is supplied
          data = getDate(formatDate(data, true))
          break
        case 'height':
        case 'weight':
          data = parseInt(data)
          break
        default:
          data = valueRef
      }

      await db.star.update({ where: { id }, data: { [label]: data } })
    }

    return NextResponse.json({
      reload,
      content: data,
      similar: await getSimilarStars(id)
    })
  } else if (ignore !== undefined) {
    return NextResponse.json(
      await db.star.update({
        where: { id },
        data: { autoTaggerIgnore: ignore }
      })
    )
  }
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return NextResponse.json(
    await db.star.delete({
      where: { id }
    })
  )
}

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const videos = await db.video.findMany({
    where: { starID: id },
    select: {
      id: true,
      name: true,
      date: true,
      path: true,
      starAge: true,
      cover: true,
      star: { select: { birthdate: true } },
      website: { select: { name: true } },
      site: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  })

  const { haircolors: starHaircolors, ...star } = await db.star.findFirstOrThrow({
    where: { id },
    select: {
      id: true,
      name: true,
      image: true,
      autoTaggerIgnore: true,
      breast: true,
      haircolors: true,
      ethnicity: true,
      birthdate: true,
      height: true,
      weight: true,
      api: true
    }
  })

  const { autoTaggerIgnore, breast, ethnicity, birthdate, height, weight, api, ...rest } = star

  return NextResponse.json({
    star: {
      ...rest,
      slug: api,
      ignored: autoTaggerIgnore,
      info: {
        breast: breast ?? '',
        haircolor: starHaircolors.map(({ hair: haircolor }) => haircolor),
        ethnicity: ethnicity ?? '',
        // items without autocomplete
        birthdate: birthdate ? formatDate(birthdate, true) : '',
        height: height?.toString() ?? '',
        weight: weight?.toString() ?? ''
      },
      similar: await getSimilarStars(star.id)
    },
    videos: videos
      .map(({ path, website, site, starAge, star, cover, ...video }) => ({
        ...video,
        date: formatDate(video.date),
        fname: path,
        website: website.name,
        site: site?.name ?? null,
        age: starAge ?? dateDiff(star?.birthdate, video.date),
        image: cover ?? '',
        hidden: false
      }))
      .sort((a, b) => a.age - b.age)
  })
}
