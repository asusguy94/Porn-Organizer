import { Typography } from '@mui/material'

import VGrid from '@components/virtualized/virtuoso'

import { getVisible } from './helper'

interface CardProps<T> {
	label: string
	data: T[]
	height: number
	render: (id: number) => JSX.Element
}
function Card<T>({ label, height, data, render }: CardProps<T>) {
	const visibleData = getVisible(data)

	return (
		<div id={label}>
			<Typography variant='h6' className='text-center'>
				<span className='count'>{visibleData.length}</span> Videos
			</Typography>

			<VGrid itemHeight={height} total={visibleData.length} renderData={render} />
		</div>
	)
}

export default Card
