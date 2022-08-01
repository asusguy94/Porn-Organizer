import classes from './ribbon.module.scss'

interface RibbonProps {
	isFirst?: boolean
	isLast?: boolean
	align?: string
	label?: string | number
}
const Ribbon = ({ isFirst = false, isLast = false, align, label }: RibbonProps) => {
	const className = `${classes.ribbon} ${
		align === 'left' ? `${classes['ribbon-left']} ${classes['ribbon-purple']}` : ''
	}`

	return isFirst ? (
		<span className={className}>First</span>
	) : isLast ? (
		<span className={className}>Latest</span>
	) : label ? (
		<span className={className}>{label}</span>
	) : null
}

interface ContainerProps {
	children: React.ReactNode
	component?: any
	className?: string
}
export const RibbonContainer = ({ children, component: Component = 'div', className = '' }: ContainerProps) => {
	return <Component className={`${classes['ribbon-container']} ${className}`}>{children}</Component>
}

export default Ribbon
