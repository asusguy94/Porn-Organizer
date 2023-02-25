import { themeConfig } from '@config'

type IconProps = {
  code: keyof typeof themeConfig
  className?: string
}

const Icon = ({ code, className = '' }: IconProps) => <i className={`${themeConfig[code]} ${className}`} />

export default Icon
