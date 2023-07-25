import { VirtuosoGrid } from 'react-virtuoso'

import styles from './virtuoso.module.scss'

type GridProps = {
  renderData: (id: number) => JSX.Element
  total: number
  itemHeight: number
  itemRows?: number
  listClassName?: string
}
const Grid = ({ renderData, total, itemHeight, itemRows = 1, listClassName = '' }: GridProps) => (
  <VirtuosoGrid
    useWindowScroll
    overscan={itemHeight * itemRows}
    totalCount={total}
    itemContent={renderData}
    listClassName={`${styles['grid-list']} ${listClassName}`}
  />
)

export default Grid
