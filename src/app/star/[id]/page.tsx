import Client from './client'

import { Params } from '@interfaces'
import { dateDiff, getSimilarStars } from '@utils/server/helper'
import prisma from '@utils/server/prisma'
import { formatDate, getUnique } from '@utils/shared'

export default async function StarPage({ params }: Params<'id'>) {
  const id = parseInt(params.id)

  const breasts = await prisma.star.findMany({ where: { breast: { not: null } }, orderBy: { breast: 'asc' } })
  const haircolors = await prisma.haircolor.findMany({ orderBy: { name: 'asc' } })
  const ethnicities = await prisma.star.findMany({ where: { ethnicity: { not: null } }, orderBy: { ethnicity: 'asc' } })
  const websites = await prisma.website.findMany({ orderBy: { name: 'asc' } })

  const videos = await prisma.video.findMany({
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

  const { haircolors: starHaircolors, ...star } = await prisma.star.findFirstOrThrow({
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
  return (
    <Client
      breast={getUnique(breasts.flatMap(({ breast }) => (breast !== null ? [breast] : [])))}
      haircolor={haircolors.map(haircolor => haircolor.name)}
      ethnicity={getUnique(ethnicities.flatMap(({ ethnicity }) => (ethnicity !== null ? [ethnicity] : [])))}
      websites={websites.map(website => website.name)}
      star={{
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
      }}
      videos={videos
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
        .sort((a, b) => a.age - b.age)}
    />
  )
}
