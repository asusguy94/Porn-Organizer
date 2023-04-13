import { VirtuosoGrid } from 'react-virtuoso'

import styles from './virtuoso.module.scss'

type GridProps = {
  renderData: (id: number) => JSX.Element
  total: number
  itemHeight: number
  itemRows?: number
}
const Grid = ({ renderData, total, itemHeight, itemRows = 1 }: GridProps) => (
  <VirtuosoGrid
    useWindowScroll
    overscan={itemHeight * itemRows}
    totalCount={total}
    itemContent={renderData}
    listClassName={styles['grid-list']}
  />
)

export default Grid
