import NextImage, { ImageProps as NextImageProps } from 'next/image'

import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { CardMedia as MUICardMedia } from '@mui/material'

export function ResponsiveImage({ alt, ...other }: NextImageProps & MissingImage) {
  return <Image style={{ width: '100%', height: 'auto' }} alt={alt} {...other} />
}

export default function Image({ missing, scale, renderStyle, ...nextProps }: NextImageProps & MissingImage) {
  if (missing) return <MissingImage scale={scale} renderStyle={renderStyle} />

  // Main Image Component
  return <NextImage {...nextProps} />
}

type CardProps = {
  height: number
  alt: string
  responsive?: boolean
} & Omit<NextImageProps, 'alt' | 'height'> &
  MissingImage

export function ImageCard({
  height,
  alt,
  missing = false,
  renderStyle = 'height',
  responsive = false,
  ...other
}: CardProps) {
  return (
    <MUICardMedia style={missing ? { height, textAlign: 'center' } : {}}>
      {responsive ? (
        <ResponsiveImage alt={alt} height={height} missing={missing} renderStyle={renderStyle} {...other} />
      ) : (
        <Image alt={alt} height={height} missing={missing} renderStyle={renderStyle} {...other} />
      )}
    </MUICardMedia>
  )
}

type MissingImage = {
  missing?: boolean
} & MissingImageProps

type MissingImageProps = {
  scale?: number
  renderStyle?: 'height' | 'transform'
}

function MissingImage({ scale = 1, renderStyle }: MissingImageProps) {
  if (scale <= 0) throw new Error('Scale must be greater than zero')

  return (
    <ImageNotSupportedOutlinedIcon
      color='action'
      fontSize='large'
      style={{
        ...(renderStyle === 'height'
          ? { height: '100%' }
          : renderStyle === 'transform'
          ? { transform: 'translateY(100%)' } //TODO why 100%
          : {}),
        scale: scale.toString()
      }}
    />
  )
}
