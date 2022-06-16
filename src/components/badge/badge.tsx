import './badge.scss'

interface IBadge {
	content: number
	children: React.ReactNode
}
const Badge = ({ content, children }: IBadge) => {
	const badgeClass = `badge-${'x'.repeat(String(content).length)}`

	return (
		<div className={badgeClass} data-badge={content}>
			{children}
		</div>
	)
}

export default Badge
