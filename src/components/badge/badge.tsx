import classes from './badge.module.scss'

interface IBadge {
	content: number
	children: React.ReactNode
}
const Badge = ({ content, children }: IBadge) => {
	const badgeClass = String(content).length < 10 ? classes['badge--small'] : classes['badge--large']

	return (
		<div className={badgeClass} data-badge={content}>
			{children}
		</div>
	)
}

export default Badge
