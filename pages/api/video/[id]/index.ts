import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'
import Joi from 'joi'

import { prisma, validate } from '@utils/server'
import { dateDiff, downloader, formatDate, getDate, isNewDate, noExt, removeThumbnails } from '@utils/server/helper'
import { generateDate, generateStarName } from '@utils/server/generate'
import { resizeImage } from '@utils/server/ffmpeg'
import { getSceneData, getSceneSlug } from '@utils/server/metadata'
import { settingsConfig } from '@config'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) },
        include: {
          star: true,
          plays: true,
          website: true,
          site: true,
          locations: { include: { location: true } },
          attributes: { include: { attribute: true } }
        }
      })

      res.json({
        id: video.id,
        name: video.name,
        image: video.cover,
        slug: video.api,
        path: {
          file: video.path,
          stream: `${video.path.split('.').slice(0, -1).join('.')}/master.m3u8`
        },
        date: {
          added: formatDate(video.added),
          published: video.date ? formatDate(video.date) : undefined,
          invalid:
            video.api && video.date
              ? (await getSceneData(video.api)).date.trim() !== formatDate(video.date, true)
              : false
        },
        duration: video.duration,
        height: video.height,
        plays: video.plays.length,
        website: video.website!.name,
        star: generateStarName(video.path),
        locations: video.locations.map(({ location }) => location),
        attributes: video.attributes.map(({ attribute }) => attribute),
        subsite: video.site?.name ?? null
      })
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { title, starAge, plays, slug, path, date, cover } = validate(
        Joi.object({
          title: Joi.string(),
          starAge: Joi.number().integer().min(18).max(99).allow(null),
          plays: Joi.number().integer().min(0),
          slug: Joi.string().allow(''),
          path: Joi.string(),
          date: Joi.boolean(),
          cover: Joi.boolean()
        }),
        req.body
      )

      if (title !== undefined) {
        await prisma.video.update({
          where: { id: parseInt(id) },
          data: { name: title }
        })
      } else if (starAge !== undefined) {
        await prisma.video.update({
          where: { id: parseInt(id) },
          data: { starAge: starAge }
        })
      } else if (plays !== undefined) {
        if (!plays) {
          // Reset PLAYS
          await prisma.plays.deleteMany({ where: { videoID: parseInt(id) } })
        } else {
          // Add PLAY
          await prisma.plays.create({
            data: { video: { connect: { id: parseInt(id) } } }
          })
        }
      } else if (slug !== undefined) {
        if (!slug) {
          // Reset SLUG
          await prisma.video.update({
            where: { id: parseInt(id) },
            data: { api: null }
          })
        } else {
          // Add Slug
          await getSceneSlug(slug).then(async data => {
            await prisma.video.update({
              where: { id: parseInt(id) },
              data: { api: data }
            })
          })
        }
      } else if (path !== undefined) {
        const { path: oldPath } = await prisma.video.findFirstOrThrow({
          where: { id: parseInt(id) }
        })

        // Update Database
        await prisma.video.update({ where: { id: parseInt(id) }, data: { path } }).then(async video => {
          // Rename File
          await fs.promises.rename(`./media/videos/${oldPath}`, `./media/videos/${video.path}`).then(async () => {
            await fs.promises.rename(`./media/videos/${noExt(oldPath)}`, `./media/videos/${noExt(video.path)}`)
          })
        })
      } else if (date !== undefined) {
        const video = await prisma.video.findFirstOrThrow({
          where: { id: parseInt(id) },
          include: { star: true }
        })
        const fileDate = generateDate(video.path)

        if (video.date !== null && isNewDate(video.date, fileDate)) {
          await prisma.video.update({
            where: { id: parseInt(id) },
            data: { date: getDate(fileDate) }
          })
        }

        res.json({
          date: formatDate(fileDate),
          age: dateDiff(video.star?.birthdate, video.date)
        })
      } else if (cover !== undefined) {
        const video = await prisma.video.findFirstOrThrow({
          where: { id: parseInt(id) }
        })
        if (video.api) {
          const { image } = await getSceneData(video.api)
          if (image) {
            const imagePath = `images/videos/${video.id}.jpg`
            const imagePath_low = `images/videos/${video.id}-${settingsConfig.THUMB_RES}.jpg`

            console.log(`Generating HIGHRES ${video.id}`)
            await downloader(image, `media/${imagePath}`)

            console.log(`Generating LOWRES ${video.id}`)
            await downloader(image, `media/${imagePath_low}`)
            resizeImage(`./media/${imagePath_low}`, settingsConfig.THUMB_RES)

            await prisma.video.update({ where: { id: parseInt(id) }, data: { cover: `${video.id}.jpg` } })
          }
        }
      } else {
        // Refresh Video

        // Update Database
        await prisma.video.update({
          where: { id: parseInt(id) },
          data: { duration: 0, height: 0 }
        })

        // Remove Files
        await removeThumbnails(parseInt(id))
      }

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.video.delete({ where: { id: parseInt(id) } }).then(async video => {
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
  }

  res.status(400)
}
