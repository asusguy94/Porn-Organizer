import Client from './client'

import { VideoStar } from '@interfaces'
import { Params } from '@interfaces'
import { generateStarName } from '@utils/server/generate'
import { dateDiff } from '@utils/server/helper'
import { getSceneData } from '@utils/server/metadata'
import prisma from '@utils/server/prisma'
import { formatDate } from '@utils/shared'

export default async function VideoPage({ params }: Params<'id'>) {
  const id = parseInt(params.id)

  const attributes = await prisma.attribute.findMany()
  const categories = await prisma.category.findMany()
  const locations = await prisma.location.findMany()

  const bookmarks = await prisma.bookmark.findMany({
    select: {
      id: true,
      category: { select: { id: true, name: true } },
      start: true
    },
    where: { videoID: id },
    orderBy: { start: 'asc' }
  })

  const star = await prisma.star.findFirst({
    where: { videos: { some: { id } } },
    select: { id: true, name: true, image: true, birthdate: true }
  })

  let starVal: VideoStar | null = null
  if (star !== null) {
    const videos = await prisma.video.findMany({
      where: { starID: star.id }
    })

    const { birthdate, ...rest } = star
    starVal = {
      ...rest,
      ageInVideo: dateDiff(videos.find(v => v.id === id)?.date, birthdate),
      numVideos: videos.length
    }
  }

  const video = await prisma.video.findFirstOrThrow({
    where: { id },
    select: {
      id: true,
      name: true,
      cover: true,
      api: true,
      path: true,
      added: true,
      date: true,
      duration: true,
      height: true,
      plays: true,
      website: true,
      locations: { select: { location: true } },
      attributes: { select: { attribute: true } },
      site: true,
      apiDate: true,
      validated: true
    }
  })

  if (video.api !== null) {
    // check if date has been validated
    if (!(video.apiDate !== null && formatDate(video.date, true) === video.apiDate)) {
      try {
        video.apiDate = (await getSceneData(video.api)).date.trim()

        // ony update database with new apiDate if nessesary
        await prisma.video.update({
          where: { id: video.id },
          data: { apiDate: video.apiDate }
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  const { cover, api, path, added, site, apiDate, ...rest } = video
  return (
    <Client
      attributes={attributes}
      categories={categories}
      locations={locations}
      video={{
        ...rest,
        image: cover,
        slug: api,
        path: {
          file: path,
          stream: `${path.split('.').slice(0, -1).join('.')}/master.m3u8`
        },
        date: {
          added: formatDate(added),
          published: formatDate(rest.date),
          apiDate: apiDate !== null ? formatDate(apiDate) : null
        },
        plays: rest.plays.length,
        website: rest.website.name,
        star: generateStarName(path),
        locations: rest.locations.map(({ location }) => location),
        attributes: rest.attributes.map(({ attribute }) => attribute),
        subsite: site?.name ?? ''
      }}
      star={starVal}
      bookmarks={bookmarks}
    />
  )
}
