import sharp from 'sharp'
import getDimensions from 'get-video-dimensions'
import { getVideoDurationInSeconds } from 'get-video-duration'

const getDuration = async (file: string) => Number(await getVideoDurationInSeconds(file))
const getHeight = async (file: string) => (await getDimensions(file)).height

export async function resizeImage(src: string, width: number) {
  sharp.cache(false)

  const buffer = await sharp(src).resize(width).toBuffer()
  await sharp(buffer).toFile(src)
}

export const duration = async (file: string) => await getDuration(file)
export const height = async (file: string) => await getHeight(file)
