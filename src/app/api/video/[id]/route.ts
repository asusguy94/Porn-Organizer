import { Params } from '@interfaces'
import { generateStarName } from '@utils/server/generate'
import { getSceneData } from '@utils/server/metadata'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { formatDate } from '@utils/shared'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const video = await db.video.findFirstOrThrow({
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
        await db.video.update({
          where: { id: video.id },
          data: { apiDate: video.apiDate }
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  const { cover, api, path, added, site, apiDate, ...rest } = video
  return Response.json({
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
  })
}
