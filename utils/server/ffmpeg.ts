import sharp from 'sharp'
import generatePreview from 'ffmpeg-generate-video-preview'
import getDimensions from 'get-video-dimensions'
import ffmpeg from 'fluent-ffmpeg'

import { generateVTTData, getDividableWidth } from './helper'

const getRawHeight = async (file: string) => (await getDimensions(file)).height
const getRawWidth = async (file: string) => (await getDimensions(file)).width

const getRawDuration = async (file: string) => {
  return new Promise<number>((resolve, reject) => {
    ffmpeg.ffprobe(file, (err, data) => {
      if (err) {
        reject(err)
        return
      }

      const format = data.format.duration
      if (format === undefined) {
        reject('Duration is undefined')
        return
      }

      resolve(format)
    })
  })
}

export async function resizeImage(src: string, width: number) {
  sharp.cache(false)

  const buffer = await sharp(src).resize(width).toBuffer()
  await sharp(buffer).toFile(src)
}

export const getDuration = async (file: string) => Math.round(await getRawDuration(file))
export const getHeight = async (file: string) => await getRawHeight(file)
export const getWidth = async (file: string) => await getRawWidth(file)

export const extractVtt = async (src: string, dest: string, videoID: number) => {
  const duration = await getRawDuration(src) // in seconds

  const cols = 8 // images per row
  const rows = 40 // images per column

  const delay = duration / (rows * cols)

  /* Generate Preview */
  const {
    width: calcWidth,
    height: calcHeight,
    rows: numRows,
    cols: numCols
  } = await generatePreview({
    input: src,
    output: dest,
    width: getDividableWidth(await getRawWidth(src)),
    quality: 3, // 3>> less than 4MB
    rows: rows,
    cols: cols
  })

  /* Generate VTT output */
  await generateVTTData(
    videoID,
    delay,
    { rows: numRows, cols: numCols },
    {
      width: calcWidth,
      height: calcHeight
    }
  )
}
