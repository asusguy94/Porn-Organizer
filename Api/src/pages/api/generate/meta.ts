import { NextApiRequest, NextApiResponse } from 'next/types'

import { Video } from '@prisma/client'
import socket from '@utils/pusher/server'
import { rebuildVideoFile, getDuration, getHeight, getWidth } from '@utils/server/ffmpeg'
import { generateStarName } from '@utils/server/generate'
import { fileExists, logger, sleep } from '@utils/server/helper'
import { aliasExists, aliasIsIgnored, getAliasAsStar, starExists, starIsIgnored } from '@utils/server/helper.db'
import { findSceneSlug } from '@utils/server/metadata'
import { db } from '@utils/server/prisma'
import { getProgress } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const checkStarRelation = async (video: Video, progress: number) => {
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
          await addVideoStar(video.id, (await db.star.findFirstOrThrow({ where: { name: star } })).id, progress)
        } else if (await starAliasExists(star)) {
          await addVideoStar(video.id, (await getAliasAsStar(star)).id, progress)
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

    const addVideoStar = async (videoID: number, starID: number, progress: number) => {
      socket.trigger('ffmpeg', 'generate-star', { progress })

      await db.video.update({ where: { id: videoID }, data: { star: { connect: { id: starID } } } })
    }

    const fixVideos = await db.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }, { width: 0 }] } })
    socket.trigger('ffmpeg', 'generate-video', { progress: 0 })
    for (let i = 0; i < fixVideos.length; i++) {
      const video = fixVideos[i]

      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      const { progress } = getProgress(i, fixVideos.length)

      if (await fileExists(absoluteVideoPath)) {
        socket.trigger('ffmpeg', 'generate-video', { progress })
        await rebuildVideoFile(absoluteVideoPath).then(async () => {
          // TODO Remove stream-directory in videos/
          // TODO Remove VTT & JPG files in /vtt

          const width = await getWidth(absoluteVideoPath)
          const height = await getHeight(absoluteVideoPath)
          const duration = await getDuration(absoluteVideoPath)

          await db.video.update({
            where: { id: video.id },
            data: { duration, height, width }
          })
        })
      }
    }
    socket.trigger('ffmpeg', 'generate-video', { progress: 1 })

    const infoVideos = await db.video.findMany({
      where: { api: null, ignoreMeta: false },
      include: { site: true, website: true }
    })
    socket.trigger('ffmpeg', 'generate-video-info', { progress: 0 })
    for (let i = 0; i < infoVideos.length; i++) {
      const video = infoVideos[i]

      const { progress } = getProgress(i, infoVideos.length)

      socket.trigger('ffmpeg', 'generate-video-info', { progress })

      await sleep(400) // 400ms between requests
      await findSceneSlug(generateStarName(video.path), video.name, video.site?.name ?? video.website.name)
        .then(async slug => {
          await db.video.update({ where: { id: video.id }, data: { api: slug, ignoreMeta: true } })
        })
        .catch(async (reason: string) => {
          if (reason === 'too few slugs' || reason === 'too many slugs') {
            await db.video.update({ where: { id: video.id }, data: { ignoreMeta: true } })
          }
          logger(`cannot generate slug for ${video.name}`)
          logger(reason)
        })
    }
    socket.trigger('ffmpeg', 'generate-video-info', { progress: 1 })

    const videos = await db.video.findMany({ where: { starID: null } })
    socket.trigger('ffmpeg', 'generate-star', { progress: 0 })
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]

      const { progress } = getProgress(i, videos.length)

      // Only check relation if the video has not been moved!
      if (await fileExists(`./media/videos/${video.path}`)) {
        await checkStarRelation(video, progress)
      }
    }
    socket.trigger('ffmpeg', 'generate-star', { progress: 1 })

    logger('FINISHED GENERATING METADATA')

    res.end()
  }

  res.status(400)
}
