import { isHidden } from '../search/helper'
import { IndexType } from '@interfaces'

interface LabelCountProps<T> {
  obj: T[]
  isArr?: boolean
  label: string
  prop: string
}

function LabelCount<T extends IndexType>({ obj, isArr = false, label, prop }: LabelCountProps<T>) {
  const getPropCount = (prop: string, label: string, visibleOnly = false) => {
    const arr = obj.filter(item => item[prop]?.includes(label) && !(isHidden(item) && visibleOnly))

    return arr.length
  }

  const getArrCount = (prop: string, label: string, visibleOnly = false) => {
    const arr = obj.filter(item => item[prop]?.includes(label) && !(isHidden(item) && visibleOnly))

    return arr.length
  }

  return (
    <>
      ({isArr ? getArrCount(prop, label, true) : getPropCount(prop, label, true)}
      <span className='divider'>|</span>
      {isArr ? getArrCount(prop, label) : getPropCount(prop, label)})
    </>
  )
}

export default LabelCount
