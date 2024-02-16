import { HTMLAttributes } from 'react'

import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'
import { CardMedia as MUICardMedia } from '@mui/material'

type ImageDimensions = {
  width?: number
  height?: number
}

export function ResponsiveImage({
  ...other
}: HTMLAttributes<HTMLImageElement> & MissingImage & ImageDimensions & { src: string }) {
  return <Image style={{ width: '100%', height: 'auto' }} {...other} />
}

export default function Image({
  missing,
  scale,
  renderStyle,
  ...props
}: HTMLAttributes<HTMLImageElement> & MissingImage & ImageDimensions & { src: string }) {
  if (missing) return <MissingImage scale={scale} renderStyle={renderStyle} />

  // Main Image Component
  return <img {...props} />
}

type CardProps = {
  height: number
  responsive?: boolean
} & MissingImage & { src: string }

export function ImageCard({
  height,
  missing = false,
  renderStyle = 'height',
  responsive = false,
  ...other
}: CardProps) {
  return (
    <MUICardMedia style={missing ? { height, textAlign: 'center' } : {}}>
      {responsive ? (
        <ResponsiveImage height={height} missing={missing} renderStyle={renderStyle} {...other} />
      ) : (
        <Image height={height} missing={missing} renderStyle={renderStyle} {...other} />
      )}
    </MUICardMedia>
  )
}

type MissingImage = {
  missing?: boolean
} & MissingImageProps &
  HTMLAttributes<HTMLImageElement> &
  ImageDimensions

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
