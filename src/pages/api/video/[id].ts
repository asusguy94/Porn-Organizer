import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'

import { settingsConfig } from '@config'
import { resizeImage } from '@utils/server/ffmpeg'
import { generateDate, generateStarName } from '@utils/server/generate'
import {
  dateDiff,
  downloader,
  fileExists,
  getDate,
  isNewDate,
  logger,
  noExt,
  removeThumbnails
} from '@utils/server/helper'
import { getSceneData, getSceneSlug } from '@utils/server/metadata'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { formatDate, printError } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = validate(z.object({ id: z.coerce.number() }), req.query)

  if (req.method === 'GET') {
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
    res.send({
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
  } else if (req.method === 'PUT') {
    const { title, starAge, plays, slug, path, date, cover, validated } = validate(
      z.object({
        title: z.string().optional(),
        starAge: z.number().int().min(18).max(99).nullable().optional(),
        plays: z.number().int().min(0).optional(),
        slug: z.string().optional(),
        path: z.string().optional(),
        date: z.boolean().optional(),
        cover: z.boolean().or(z.string().url()).optional(),
        validated: z.literal(true).optional()
      }),
      req.body
    )

    if (title !== undefined) {
      await db.video.update({
        where: { id },
        data: { name: title }
      })
    } else if (starAge !== undefined) {
      await db.video.update({
        where: { id },
        data: { starAge: starAge }
      })
    } else if (validated !== undefined) {
      await db.video.update({
        where: { id },
        data: { validated: validated }
      })
    } else if (plays !== undefined) {
      if (!plays) {
        // Reset PLAYS
        await db.plays.deleteMany({ where: { videoID: id } })
      } else {
        // Add PLAY
        await db.plays.create({ data: { video: { connect: { id } } } })
      }
    } else if (slug !== undefined) {
      if (!slug) {
        // Reset SLUG
        await db.video.update({
          where: { id },
          data: { api: null, apiDate: null }
        })
      } else {
        // Add Slug
        await getSceneSlug(slug).then(async data => {
          await db.video.update({
            where: { id },
            data: { api: data, apiDate: null }
          })
        })
      }
    } else if (path !== undefined) {
      const orig = await db.video.findFirstOrThrow({ where: { id } })

      // Update Database
      await db.video.update({ where: { id: orig.id }, data: { path } }).then(async video => {
        await Promise.allSettled([
          // Rename File
          fs.promises.rename(`./media/videos/${orig.path}`, `./media/videos/${video.path}`),

          // Rename Dir
          fs.promises.rename(`./media/videos/${noExt(orig.path)}`, `./media/videos/${noExt(video.path)}`)
          //TODO the last one throws if the folder doesn't exist
        ])
      })
    } else if (date !== undefined) {
      const video = await db.video.findFirstOrThrow({
        where: { id },
        include: { star: true }
      })
      const fileDate = generateDate(video.path)

      if (isNewDate(video.date, fileDate)) {
        await db.video.update({
          where: { id },
          data: { date: getDate(fileDate) }
        })
      }

      res.json({
        date: formatDate(fileDate),
        age: dateDiff(video.star?.birthdate, video.date)
      })
    } else if (cover !== undefined) {
      const video = await db.video.findFirstOrThrow({ where: { id } })
      if (video.api) {
        try {
          const image = typeof cover === 'string' ? cover : (await getSceneData(video.api, true)).image
          if (image) {
            const imagePath = `images/videos/${video.id}.jpg`
            const imagePath_low = `images/videos/${video.id}-${settingsConfig.THUMB_RES}.jpg`

            // download file (if missing)
            if (!(await fileExists(`./media/${imagePath}`))) {
              logger(`Generating HIGHRES ${video.id}`)
              await downloader(image, `media/${imagePath}`, 'URL')

              // upscale image to w=1920
              await resizeImage(`./media/${imagePath}`, settingsConfig.IMAGE_RES)
            }

            {
              logger(`Generating LOWRES ${video.id}`)
              await downloader(`media/${imagePath}`, `media/${imagePath_low}`, 'FILE') // copy file

              // downscale image to w=290
              await resizeImage(`./media/${imagePath_low}`, settingsConfig.THUMB_RES)
            }

            await db.video.update({ where: { id: video.id }, data: { cover: `${video.id}.jpg` } })
          }
        } catch (error) {
          printError(error)
        }
      }
    } else {
      // Refresh Video

      // Update Database
      await db.video.update({
        where: { id },
        data: { duration: 0, height: 0 }
      })

      // Remove Files
      await removeThumbnails(id)
    }

    res.end()
  } else if (req.method === 'DELETE') {
    await db.video.delete({ where: { id } }).then(async video => {
      await removeThumbnails(video.id)

      await Promise.allSettled([
        // remove video-file
        fs.promises.unlink(`./media/videos/${video.path}`),

        // remove stream-files
        fs.promises.rm(`./media/videos/${noExt(video.path)}`, { recursive: true, force: true })
      ])
    })

    res.end()
  }

  res.status(400)
}
