import { FC } from 'react'

import './badge.scss'

const Badge: FC<{ content: string | number }> = ({ content, children }) => {
	const badgeClass = `badge-${'x'.repeat(String(content).length)}`

	return (
		<div className={badgeClass} data-badge={content}>
			{children}
		</div>
	)
}

export default Badge
