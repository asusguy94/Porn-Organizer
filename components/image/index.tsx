import { CardMedia as MUICardMedia } from '@mui/material'
import NextImage, { type ImageProps as NextImageProps } from 'next/image'
import ImageNotSupportedOutlinedIcon from '@mui/icons-material/ImageNotSupportedOutlined'

export const ResponsiveImage = ({ alt, ...other }: Omit<NextImageProps, 'sizes'> & IMissingImage) => {
  return <Image sizes='100vw' style={{ width: '100%', height: 'auto' }} alt={alt} {...other} />
}

const Image = ({ missing, scale, renderStyle, ...nextProps }: NextImageProps & IMissingImage) => {
  if (missing) return <MissingImage scale={scale} renderStyle={renderStyle} />

  return <NextImage {...nextProps} />
}

interface CardProps extends Omit<NextImageProps, 'alt' | 'height'>, IMissingImage {
  height: number
  alt: string
  responsive?: boolean
}

export const ImageCard = ({
  height,
  alt,
  missing = false,
  renderStyle = 'height',
  responsive = false,
  ...other
}: CardProps) => {
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

interface IMissingImage extends MissingImageProps {
  missing?: boolean
}

interface MissingImageProps {
  scale?: number
  renderStyle?: 'height' | 'transform'
}

const MissingImage = ({ scale = 1, renderStyle }: MissingImageProps) => {
  if (scale <= 0) throw new Error('Scale must be greater than zero')

  return (
    <ImageNotSupportedOutlinedIcon
      color='action'
      fontSize='large'
      style={{
        ...(renderStyle === 'height'
          ? { height: '100%' }
          : renderStyle === 'transform'
          ? { transform: 'translateY(100%)' }
          : {}),
        scale: scale.toString()
      }}
    />
  )
}

export default Image
