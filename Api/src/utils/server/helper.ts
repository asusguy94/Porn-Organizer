import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import fetch from 'node-fetch'

import fs from 'fs'
import path from 'path'

import { db } from './prisma'

import { settingsConfig } from '@config'
import { SimilarStar } from '@interfaces/api'
import { calculateTimeCode } from '@utils/shared'

dayjs.extend(utc)

export function dateDiff(
  date1?: string | Date | null,
  date2: string | Date | null = new Date(),
  relative = true
): number {
  if (date1 === null || date1 === undefined || date2 === null) return 0

  const diff = dayjs(date1).diff(dayjs(date2), 'days')

  return relative ? Math.abs(diff) : diff
}

export async function downloader(url: string, dest: string, type: 'URL' | 'FILE'): Promise<void> {
  let buffer: Uint8Array
  if (type === 'URL') {
    const response = await fetch(url)
    buffer = new Uint8Array(await response.arrayBuffer())
  } else {
    buffer = await fs.promises.readFile(url)
  }

  await fs.promises.writeFile(dest, buffer)
}

export const extOnly = (dir: string): string => path.parse(dir).ext
export function dirOnly(dir: string, root = false): string {
  if (root) {
    return path.parse(dir).dir
  }

  return path.parse(dir).name
}
export function noExt(dir: string): string {
  const parsed = path.parse(dir)

  if (parsed.dir) {
    return `${parsed.dir}/${parsed.name}`
  }

  return parsed.name
}

export async function removeThumbnails(videoID: number) {
  await Promise.allSettled([
    // Remove Images
    fs.promises.unlink(`./media/images/videos/${videoID}.jpg`),
    fs.promises.unlink(`./media/images/videos/${videoID}-${settingsConfig.THUMB_RES}.jpg`),

    // Remove Previews
    fs.promises.unlink(`./media/vtt/${videoID}.vtt`),
    fs.promises.unlink(`./media/vtt/${videoID}.jpg`)
  ])
}

/**
 * Check if a file exists
 * @param {string} path Path to check
 * @return {Promise<boolean>} Returns true if the file exists
 */
export async function fileExists(path: string): Promise<boolean> {
  return new Promise<boolean>(resolve => fs.access(path, fs.constants.F_OK, err => resolve(!err)))
}

export const getDate = (dateStr: string) => dayjs.utc(dateStr).toDate()

export function formatBreastSize(input: string): string {
  input = input.toUpperCase().trim()

  if (input.length > 1) {
    const charCode = input.charCodeAt(0) + input.length - 1
    return String.fromCharCode(((charCode - 65) % 26) + 65)
  }

  return input
}

export async function getSimilarStars(starID: number, maxMaxLength = 9): Promise<SimilarStar[]> {
  const currentStar = await db.star.findFirstOrThrow({ where: { id: starID }, include: { haircolors: true } })

  const match_default = 2
  const match_important = 5
  const decimals = 0

  const otherStars = (await db.star.findMany({ where: { id: { not: starID } }, include: { haircolors: true } }))
    .map(otherStar => {
      let match = 100

      //TODO add better comparison of haircolors
      if (currentStar.breast !== null && otherStar.breast !== currentStar.breast) match -= match_important
      if (currentStar.haircolors.length !== 0 && otherStar.haircolors !== currentStar.haircolors)
        match -= match_important
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

/**
 * Check two dates are identical
 * @param {string|Date} dateStr1 First date
 * @param {string|Date} dateStr2 Second date
 * @return {boolean} Returns false if dates are identical
 */
export function isNewDate(dateStr1: string | Date, dateStr2: string | Date): boolean {
  const date1 = dayjs(dateStr1)
  const date2 = dayjs(dateStr2)

  return date1.diff(date2) !== 0
}

/**
 * @param {number} id The id of the image
 * @return {string} Returns the resized thumbnail path
 */
export const getResizedThumb = (id: number): string => `${id}-${settingsConfig.THUMB_RES}.jpg`

function setCache(ageInSeconds: number, delay = 100) {
  const cacheArr = [
    'public',
    `max-age=${ageInSeconds}`,
    `s-maxage=${ageInSeconds}`,
    'must-revalidate',
    `stale-while-revalidate=${delay}`
  ]

  return { 'Cache-Control': cacheArr.join(',') }
}

export function response(message: string, statusCode: number): Response
export function response(statusCode: number): Response
export function response(messageOrStatusCode: string | number, statusCode?: number): Response {
  if (typeof messageOrStatusCode === 'string') {
    return new Response(messageOrStatusCode, { status: statusCode })
  }

  return new Response(null, { status: statusCode })
}

const missingFileError = response('File is missing', 404)

export async function sendFile(path: string) {
  if (!(await fileExists(path))) {
    return missingFileError
  }

  return new Response(await fs.promises.readFile(path), {
    headers: { ...setCache(60 * 60) }
  })
}

export async function sendPartial(req: Request, path: string, mb = 2) {
  const chunkSize = 1024 * 1024 * mb

  if (!(await fileExists(path))) {
    return missingFileError
  }

  return new Promise<Response>((resolve, reject) => {
    fs.stat(path, (err, data) => {
      if (err) throw err

      // extract start and end / empty
      const ranges = req.headers
        .get('range')
        ?.match(/^bytes=(\d+)-/)
        ?.slice(1)
      const start = parseInt(ranges?.[0] ?? '0')
      const end = Math.min(start + chunkSize, data.size - 1)

      const stream = fs.createReadStream(path, { start, end })
      const buffer: Buffer[] = []

      stream.on('data', (chunk: Buffer) => buffer.push(chunk))
      stream.on('end', () => {
        resolve(
          new Response(Buffer.concat(buffer), {
            status: 206,
            headers: {
              'Accept-Ranges': 'bytes',
              'Content-Range': `bytes ${start}-${end}/${data.size}`,
              'Content-Length': `${end - start + 1}`
            }
          })
        )
      })
      stream.on('error', error => reject(error.cause))
    })
  })
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export const toCamelCase = (str: string) => str.replace(/([a-z])([A-Z])/g, '$1 $2')

/**
 * Append Text to file
 * @param path file to be written to
 * @param content text to write to file
 */
const writeToFile = async (path: string, content: string) => fs.promises.appendFile(path, content)

export async function generateVTTData(
  videoID: number,
  frameDelay: number,
  tiles: { rows: number; cols: number },
  dimension: { height: number; width: number }
) {
  const vtt = `./media/vtt/${videoID}.vtt`

  let nextTimeCode = 0
  const generateTimeCodes = () => {
    const timeCodeFormat = 'HH:mm:ss.SSS'

    const start = calculateTimeCode(nextTimeCode, timeCodeFormat)
    const end = calculateTimeCode(nextTimeCode + frameDelay, timeCodeFormat)

    nextTimeCode += frameDelay

    return { start, end }
  }

  await writeToFile(vtt, 'WEBVTT')
  for (let row = 0, counter = 0; row < tiles.rows; row++) {
    const posY = row * dimension.height
    for (let col = 0; col < tiles.cols; col++) {
      const posX = col * dimension.width

      const { start, end } = generateTimeCodes()

      await writeToFile(vtt, '\n')
      await writeToFile(vtt, `\n${++counter}`)
      await writeToFile(vtt, `\n${start} --> ${end}`)

      // this is required for vidstack to work
      await writeToFile(
        vtt,
        `\n/api/video/${videoID}/vtt/thumb#xywh=${posX},${posY},${dimension.width},${dimension.height}`
      )
      // await writeToFile(vtt, `\nvtt/thumb#xywh=${posX},${posY},${dimension.width},${dimension.height}`)
    }
  }
}

// sizes are based on "6.jpg"
export function getDividableWidth(width: number, limits = { min: 120, max: 240 }): number {
  const MIN = 10 * 2
  const MAX = width / 2

  const increment = 10
  for (let dividend = limits.max; dividend >= limits.min; dividend--) {
    if (width % dividend === 0) return dividend
  }

  // Check if calculation is out-of-bounds
  if (limits.max + increment < MAX || limits.min - increment > MIN) {
    if (limits.max + increment < MAX) {
      limits.max += increment
    }

    if (limits.min - increment > MIN) {
      limits.min -= increment
    }

    return getDividableWidth(width, limits)
  }
  throw new Error(`Could not find dividable width for ${width}`)
}

export function logger(message: unknown) {
  console.log(message)
}

export function isError(e: unknown): e is Error {
  return e instanceof Error
}
