import { NextApiRequest } from 'next/types'

import fs from 'fs'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import {
  dateDiff,
  downloader,
  fileExists,
  formatDate,
  generateHash,
  getDate,
  isNewDate,
  logger,
  noExt,
  removeThumbnails,
  validateHash
} from '@utils/server/helper'
import { generateDate, generateStarName } from '@utils/server/generate'
import { resizeImage } from '@utils/server/ffmpeg'
import { getSceneData, getSceneSlug } from '@utils/server/metadata'
import { printError } from '@utils/shared'
import { settingsConfig } from '@config'
import { NextApiResponseWithSocket } from '@interfaces/socket'

export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket<any>) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      if (id === '0') {
        res.end()
        return
      }

      const { apiDateHash, ...video } = await prisma.video.findFirstOrThrow({
        where: { id: parseInt(id) },
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
          apiDateHash: true
        }
      })

      let invalid = false
      if (video.api !== null) {
        // check if date has been validated
        if (!(apiDateHash !== null && validateHash(formatDate(video.date, true), apiDateHash))) {
          try {
            const apiDate = (await getSceneData(video.api)).date.trim()

            // date don't match either
            invalid = apiDate !== formatDate(video.date, true)

            // ony update database with new hash if nessesary
            await prisma.video.update({
              where: { id: video.id },
              data: {
                apiDateHash: generateHash(apiDate)
              }
            })
          } catch (error) {
            console.error(error)
          }
        }
      }

      const { cover, api, path, added, site, ...rest } = video
      res.json({
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
          invalid
        },
        plays: rest.plays.length,
        website: rest.website.name,
        star: generateStarName(path),
        locations: rest.locations.map(({ location }) => location),
        attributes: rest.attributes.map(({ attribute }) => attribute),
        subsite: site?.name ?? null
      })
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { title, starAge, plays, slug, path, date, cover } = validate(
        z.object({
          title: z.string().optional(),
          starAge: z.number().int().min(18).max(99).nullable().optional(),
          plays: z.number().int().min(0).optional(),
          slug: z.string().optional(),
          path: z.string().optional(),
          date: z.boolean().optional(),
          cover: z.boolean().optional()
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
            data: { api: null, apiDateHash: null }
          })
        } else {
          // Add Slug
          await getSceneSlug(slug).then(async data => {
            await prisma.video.update({
              where: { id: parseInt(id) },
              data: { api: data, apiDateHash: null }
            })
          })
        }
      } else if (path !== undefined) {
        const { path: oldPath } = await prisma.video.findFirstOrThrow({
          where: { id: parseInt(id) }
        })

        // Update Database
        await prisma.video.update({ where: { id: parseInt(id) }, data: { path } }).then(async video => {
          await Promise.allSettled([
            // Rename File
            fs.promises.rename(`./media/videos/${oldPath}`, `./media/videos/${video.path}`),

            // Rename Dir
            fs.promises.rename(`./media/videos/${noExt(oldPath)}`, `./media/videos/${noExt(video.path)}`)
          ])
        })
      } else if (date !== undefined) {
        const video = await prisma.video.findFirstOrThrow({
          where: { id: parseInt(id) },
          include: { star: true }
        })
        const fileDate = generateDate(video.path)

        if (isNewDate(video.date, fileDate)) {
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
          try {
            const { image } = await getSceneData(video.api, true)
            if (image) {
              const imagePath = `images/videos/${video.id}.jpg`
              const imagePath_low = `images/videos/${video.id}-${settingsConfig.THUMB_RES}.jpg`

              // download file (if missing)
              if (!(await fileExists(`./media/${imagePath}`))) {
                logger(`Generating HIGHRES ${video.id}`, 'thumb', res.socket.server.io)
                await downloader(image, `media/${imagePath}`, 'URL')

                // upscale image to w=1920
                await resizeImage(`./media/${imagePath}`, settingsConfig.IMAGE_RES)
              }

              {
                logger(`Generating LOWRES ${video.id}`, 'thumb', res.socket.server.io)
                await downloader(`media/${imagePath}`, `media/${imagePath_low}`, 'FILE') // copy file

                // downscale image to w=290
                await resizeImage(`./media/${imagePath_low}`, settingsConfig.THUMB_RES)
              }

              await prisma.video.update({ where: { id: video.id }, data: { cover: `${video.id}.jpg` } })
            }
          } catch (error) {
            printError(error)
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
