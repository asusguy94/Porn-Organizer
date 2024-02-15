import { VirtuosoGrid } from 'react-virtuoso'

import styles from './virtuoso.module.css'

type GridProps = {
  renderData: (id: number) => JSX.Element
  total: number
  itemHeight: number
  itemRows?: number
  listClassName?: string
}
export default function Grid({ renderData, total, itemHeight, itemRows = 1, listClassName = '' }: GridProps) {
  return (
    <VirtuosoGrid
      useWindowScroll
      overscan={itemHeight * itemRows}
      totalCount={total}
      itemContent={renderData}
      listClassName={`${styles['grid-list']} ${listClassName}`}
    />
  )
}
