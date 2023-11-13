import { NextApiRequest, NextApiResponse } from 'next/types'

import { Video } from '@prisma/client'
import { rebuildVideoFile, getDuration, getHeight, getWidth } from '@utils/server/ffmpeg'
import { generateStarName } from '@utils/server/generate'
import { fileExists, logger, sleep } from '@utils/server/helper'
import { aliasExists, aliasIsIgnored, getAliasAsStar, starExists, starIsIgnored } from '@utils/server/helper.db'
import { findSceneSlug } from '@utils/server/metadata'
import { db } from '@utils/server/prisma'

//NEXT /video/add
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const checkStarRelation = async (video: Video) => {
      const star = generateStarName(video.path)

      // if video-star-relation is missing and video-starAlias-relation is missing
      if (!(await videoStarExists(video.id, star)) && !(await videoStarAliasExists(video.id, star))) {
        // check if star is ignored
        if (await starIsIgnored(star)) {
          return
        }

        // check if alias is ignored
        if ((await aliasExists(star)) && (await aliasIsIgnored(star))) {
          return
        }

        // add star or alias to video
        if (await starExists(star)) {
          await addVideoStar(video.id, (await db.star.findFirstOrThrow({ where: { name: star } })).id)
        } else if (await starAliasExists(star)) {
          await addVideoStar(video.id, (await getAliasAsStar(star)).id)
        }
      }
    }

    const videoStarExists = async (videoID: number, star: string) => {
      return (await db.video.count({ where: { id: videoID, star: { name: star } } })) > 0
    }

    const videoStarAliasExists = async (videoID: number, alias: string) => {
      return (
        (await db.video.count({
          where: { id: videoID, star: { alias: { every: { name: alias } } } }
        })) > 0
      )
    }

    const starAliasExists = async (alias: string) => {
      return (await db.starAlias.count({ where: { name: alias } })) > 0
    }

    const addVideoStar = async (videoID: number, starID: number) => {
      logger('Adding VideoStar')

      await db.video.update({ where: { id: videoID }, data: { star: { connect: { id: starID } } } })
    }

    logger('Updating DURATION & HEIGHT')
    const fixVideos = await db.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }, { width: 0 }] } })
    for await (const video of fixVideos) {
      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        await rebuildVideoFile(absoluteVideoPath).then(async () => {
          logger(`Rebuild: ${video.id}`)

          // TODO Remove stream-directory in videos/
          // TODO Remove VTT & JPG files in /vtt

          const width = await getWidth(absoluteVideoPath)
          const height = await getHeight(absoluteVideoPath)
          const duration = await getDuration(absoluteVideoPath)

          logger(`Refreshing: "${video.path}"`)
          await db.video.update({
            where: { id: video.id },
            data: { duration, height, width }
          })
        })
      }
    }
    logger('Finished updating DURATION & HEIGHT')

    logger('Updating VIDEO INFO')
    const infoVideos = await db.video.findMany({
      where: { api: null, ignoreMeta: false },
      include: { site: true, website: true }
    })

    for await (const video of infoVideos) {
      await sleep(400) // 400ms between requests
      await findSceneSlug(generateStarName(video.path), video.name, video.site?.name ?? video.website.name)
        .then(async slug => {
          await db.video.update({ where: { id: video.id }, data: { api: slug, ignoreMeta: true } })
        })
        .catch(async (reason: string) => {
          if (reason === 'too few slugs' || reason === 'too many slugs') {
            await db.video.update({ where: { id: video.id }, data: { ignoreMeta: true } })
          }
          logger('cannot generate slug for ' + video.name)
          logger(reason)
        })
    }
    logger('Finished updating VIDEO INFO')

    logger('Updating STARS')
    const videos = await db.video.findMany({ where: { starID: null } })
    for await (const video of videos) {
      // Only check relation if the video has not been moved!
      if (await fileExists(`./media/videos/${video.path}`)) {
        await checkStarRelation(video)
      }
    }
    logger('Finished updating STARS')

    logger('FINISHED GENERATING METADATA')

    res.end()
  }

  res.status(400)
}
