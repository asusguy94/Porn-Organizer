import { VirtuosoGrid } from 'react-virtuoso'

import './virtuoso.scss'

const Grid = ({ items, useWindowScroll = true, renderData }: any) => (
	<VirtuosoGrid useWindowScroll={useWindowScroll} totalCount={items.length} itemContent={renderData} />
)

export default Grid
