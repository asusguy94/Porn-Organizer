import { NextResponse } from 'next/server'

import fs from 'fs'

import { File } from '@interfaces'
import type { Video } from '@prisma/client'
import { generateDate, generateSite, generateTitle, generateWebsite } from '@utils/server/generate'
import { dirOnly, extOnly, getDate } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request) {
  const { videos } = validate(
    z.object({
      videos: z.array(
        z.object({
          path: z.string(),
          website: z.string(),
          site: z.string(),
          title: z.string(),
          date: z.string()
        })
      )
    }),
    await req.json()
  )

  const result: Video[] = []
  for await (const video of videos) {
    // Create WEBSITE if missing
    const website = await db.website.upsert({
      where: { name: video.website },
      create: { name: video.website },
      update: {}
    })

    const newVideo = await db.video.create({
      data: {
        path: video.path,
        name: video.title,
        date: getDate(video.date),
        website: { connect: { id: website.id } }
      },
      include: { site: true, website: true }
    })

    // Site should be used
    if (video.site.length) {
      // Create SITE if missing
      const site = await db.site.upsert({
        where: { name: video.site },
        create: { name: video.site, website: { connect: { id: website.id } } },
        update: {}
      })

      // Set SITE
      result.push(
        await db.video.update({
          where: { id: newVideo.id },
          data: { site: { connect: { id: site.id } } }
        })
      )
    }
  }

  return NextResponse.json(result)
}

export async function GET() {
  const filesDB = await db.video.findMany()
  const filesArr = filesDB.map(video => video.path)

  // TODO skip this check if directory is missing?
  const paths = await fs.promises.readdir('./media/videos')

  const newFiles: File[] = []
  for await (const path of paths) {
    if (path.includes('_')) continue

    const dirPath = `./media/videos/${path}`

    if ((await fs.promises.lstat(dirPath)).isDirectory()) {
      try {
        const files = await fs.promises.readdir(dirPath)

        for await (const file of files) {
          const filePath = `${dirPath}/${file}`
          const wsite = generateWebsite(dirPath)
          if (
            !filesArr.includes(`${wsite}/${file}`) &&
            (await fs.promises.lstat(filePath)).isFile() &&
            extOnly(filePath) === '.mp4' && // Prevent random files from being imported!
            !dirOnly(file).endsWith('_') // ignore files with '_' at the end
          ) {
            newFiles.push({
              path: `${wsite}/${file}`,
              website: wsite,
              date: generateDate(filePath),
              site: generateSite(filePath),
              title: generateTitle(filePath)
            })
          }
        }
      } catch {
        console.log(`"${dirPath}" is not readable, skipping`)
      }
    }
  }
}
