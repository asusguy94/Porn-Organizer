import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'
import path from 'path'
import fetch from 'node-fetch'
import ffmpeg from 'fluent-ffmpeg'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

import prisma from './prisma'
import { settingsConfig } from '@config'

export const dateDiff = (date1?: string | Date | null, date2: string | Date | null = new Date()): number => {
  if (date1 === null || date1 === undefined || date2 === null) return 0

  return Math.abs(dayjs(date1).diff(dayjs(date2), 'days'))
}

const getClosest = (search: number, arr: number[]): number => {
  return arr.reduce((a, b) => {
    const aDiff = Math.abs(a - search)
    const bDiff = Math.abs(b - search)

    if (aDiff === bDiff) {
      return a > b ? a : b
    } else {
      return bDiff < aDiff ? b : a
    }
  })
}

export const downloader = async (url: string, dest: string): Promise<void> => {
  const response = await fetch(url)
  const buffer = await response.buffer()

  await fs.promises.writeFile(`./${dest}`, buffer)
}

export const getUnique = <T>(arr: T[], prop?: keyof T): T[] => {
  if (prop !== undefined) {
    return arr.filter((obj, idx) => arr.findIndex(item => item[prop] === obj[prop]) === idx)
  }

  return [...new Set(arr)]
}

export const dirOnly = (dir: string, root = false): string => (root ? path.parse(dir).dir : path.parse(dir).name)
export const extOnly = (dir: string): string => path.parse(dir).ext
export const noExt = (dir: string): string => {
  const parsed = path.parse(dir)

  return parsed.dir ? `${parsed.dir}/${parsed.name}` : parsed.name
}

export const removeThumbnails = async (videoID: number) => {
  await Promise.allSettled([
    // Remove Images
    fs.promises.unlink(`./media/images/videos/${videoID}.jpg`),
    fs.promises.unlink(`./media/images/videos/${videoID}-${settingsConfig.THUMB_RES}.jpg`),

    // Remove Previews
    fs.promises.unlink(`./media/images/thumbnails/${videoID}.jpg`),
    fs.promises.unlink(`./media/vtt/${videoID}.vtt`),
    fs.promises.unlink(`./media/vtt/${videoID}.jpg`)
  ])
}

// This requires a specific pipeline, as such it is using callbacks
export const rebuildVideoFile = async (src: string): Promise<void> => {
  const { dir, ext, name } = path.parse(src)
  const newSrc = `${dir}/${name}_${ext}`

  return new Promise<void>((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/require-await
    fs.promises.rename(src, newSrc).then(async () => {
      ffmpeg(newSrc)
        .videoCodec('copy')
        .audioCodec('copy')
        .output(src)
        .on('end', () => fs.unlink(newSrc, () => resolve()))
        .on('error', err => reject(err))
        .run()
    })
  })
}

export const getClosestQ = (quality: number): number => {
  if (quality === 396) {
    return 480
  }

  return getClosest(quality, settingsConfig.qualities)
}

export const fileExists = async (path: string): Promise<boolean> => {
  return new Promise<boolean>(resolve => fs.access(path, fs.constants.F_OK, err => resolve(!err)))
}

export const getDate = (dateStr: string) => dayjs.utc(dateStr).toDate()
export const formatDate = (dateStr: string | Date, raw = false): string => {
  const date = dayjs.utc(dateStr)

  return raw ? date.format('YYYY-MM-DD') : date.format('D MMMM YYYY')
}

export const formatBreastSize = (input: string): string => {
  let breast = input.toUpperCase()

  switch (breast) {
    case 'DD':
      breast = 'E'
      break
    case 'DDD':
    case 'EE':
      breast = 'F'
      break
    case 'EEE':
    case 'FF':
      breast = 'G'
      break
    case 'FFF':
    case 'GG':
      breast = 'H'
      break
    case 'GGG':
    case 'HH':
      breast = 'I'
      break
    case 'HHH':
    case 'II':
      breast = 'J'
      break
    case 'III':
    case 'JJ':
      breast = 'K'
      break
    case 'JJJ':
    case 'KK':
      breast = 'L'
      break
    case 'KKK':
    case 'LL':
      breast = 'M'
      break
    case 'LLL':
    case 'MM':
      breast = 'N'
      break
    case 'MMM':
    case 'NN':
      breast = 'O'
      break
    case 'NNN':
    case 'OO':
      breast = 'P'
      break
    case 'OOO':
    case 'PP':
      breast = 'Q'
      break
    case 'PPP':
    case 'QQ':
      breast = 'R'
      break
    case 'QQQ':
    case 'RR':
      breast = 'S'
      break
    case 'RRR':
    case 'SS':
      breast = 'T'
      break
    case 'SSS':
    case 'TT':
      breast = 'U'
      break
    case 'TTT':
    case 'UU':
      breast = 'V'
      break
    case 'UUU':
    case 'VV':
      breast = 'W'
      break
    case 'VVV':
    case 'WW':
      breast = 'X'
      break
    case 'WWW':
    case 'XX':
      breast = 'Y'
      break
    case 'XXX':
    case 'YY':
      breast = 'Z'
      break
  }

  return breast.trim()
}

interface ISimilarStar {
  id: number
  name: string
  image: string | null
  match: number
}
export const getSimilarStars = async (starID: number, maxMaxLength = 9): Promise<ISimilarStar[]> => {
  const currentStar = await prisma.star.findFirstOrThrow({ where: { id: starID } })

  const match_default = 2
  const match_important = 5
  const decimals = 0

  const otherStars = (await prisma.star.findMany({ where: { id: { not: starID } } }))
    .map(otherStar => {
      let match = 100

      if (currentStar.breast !== null && otherStar.breast !== currentStar.breast) match -= match_important
      if (currentStar.haircolor !== null && otherStar.haircolor !== currentStar.haircolor) match -= match_important
      if (currentStar.ethnicity !== null && otherStar.ethnicity !== currentStar.ethnicity) match -= match_important
      if (currentStar.height !== null && otherStar.height !== currentStar.height) match -= match_default
      if (currentStar.weight !== null && otherStar.weight !== currentStar.weight) match -= match_default
      if (currentStar.birthdate !== null && otherStar.birthdate) {
        const now = dayjs()

        const diff_self = now.diff(dayjs(currentStar.birthdate), 'years', true).toFixed(decimals)
        const diff_other = now.diff(dayjs(otherStar.birthdate), 'years', true).toFixed(decimals)

        if (diff_self !== diff_other) match -= match_important
      }

      return { ...otherStar, match }
    })
    .filter(otherStar => otherStar.match > 0)

  return otherStars
    .sort((a, b) => b.match - a.match)
    .map(({ id, name, image, match }) => ({ id, name, image, match }))
    .slice(0, maxMaxLength)
}

export const isNewDate = (dateStr1: string | Date, dateStr2: string | Date): boolean => {
  const date1 = dayjs(dateStr1)
  const date2 = dayjs(dateStr2)

  return date1.diff(date2) !== 0
}

export const getResizedThumb = (id: number) => `${id}-${settingsConfig.THUMB_RES}.jpg`

export const sendFile = async (res: NextApiResponse, path: string) => {
  if (!(await fileExists(path))) {
    res.status(404).end()
  } else {
    res.writeHead(200)
    fs.createReadStream(path).pipe(res)
  }
}

export const sendPartial = async (req: NextApiRequest, res: NextApiResponse, path: string, mb = 2): Promise<void> => {
  const chunkSize = 1024 * 1024 * mb

  if (!(await fileExists(path))) {
    res.status(404).end()
  } else {
    fs.stat(path, (err, data) => {
      if (err) {
        throw err
      }

      if (req.headers.range !== undefined) {
        const range = req.headers.range

        // extract start and end / empty
        const ranges = range.match(/^bytes=(\d+)-(.*)$/)?.slice(1, 2)
        if (ranges !== undefined) {
          const start = parseInt(ranges[0])
          const end = Math.min(start + chunkSize, data.size - 1)

          res.writeHead(206, {
            'Accept-Ranges': 'bytes',
            'Content-Range': `bytes ${start}-${end}/${data.size}`,
            'Content-Length': end - start + 1
          })

          fs.createReadStream(path, { start, end }).pipe(res)
        }
      }
    })
  }
}

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms))
}
