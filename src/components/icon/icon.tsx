import { theme as themeConfig } from '@/config'

interface IconProps {
	code: keyof typeof themeConfig
	className?: string
}

const Icon = ({ code, className = '' }: IconProps) => <i className={`${themeConfig[code]} ${className}`} />

export default Icon
