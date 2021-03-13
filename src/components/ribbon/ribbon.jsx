const Ribbon = ({ isFirst = false, isLast = false, align, label }) => {
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
