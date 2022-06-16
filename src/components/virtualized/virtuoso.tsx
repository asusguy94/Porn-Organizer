import { VirtuosoGrid } from 'react-virtuoso'

import './virtuoso.scss'

interface GridProps {
	renderData: (id: number) => JSX.Element
	total: number
	itemHeight: number
	itemRows?: number
}
const Grid = ({ renderData, total, itemHeight, itemRows = 1 }: GridProps) => (
	<VirtuosoGrid useWindowScroll overscan={itemHeight * itemRows} totalCount={total} itemContent={renderData} />
)

export default Grid
