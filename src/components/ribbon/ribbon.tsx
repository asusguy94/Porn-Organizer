interface IRibbon {
	isFirst?: boolean
	isLast?: boolean
	align?: string
	label?: string
}

const Ribbon = ({ isFirst = false, isLast = false, align, label }: IRibbon) => {
	const className = `ribbon ${align === 'left' ? 'ribbon-left ribbon-purple' : ''}`

	return isFirst ? (
		<span className={className}>First</span>
	) : isLast ? (
		<span className={className}>Latest</span>
	) : label ? (
		<span className={className}>{label}</span>
	) : null
}

export default Ribbon
