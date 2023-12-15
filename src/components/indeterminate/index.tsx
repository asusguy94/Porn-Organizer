import { useState } from 'react'

import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material'

import RegularItem, { RegularHandlerProps } from './regular-item'

export type HandlerProps = {
  checked: boolean
  indeterminate: boolean
}
function handler({ checked, indeterminate }: HandlerProps) {
  if (checked) {
    return { indeterminate: true, checked: false }
  } else if (indeterminate) {
    return { indeterminate: false, checked: false }
  } else {
    return { indeterminate: false, checked: true }
  }
}
type ItemProps<T> = {
  label: FormControlLabelProps['label']
  value: string
  item?: T
  callback: (result: HandlerProps, item?: T) => void
}
export default function Item<T>({ label, value, item, callback }: ItemProps<T>) {
  const [indeterminate, setIndeterminate] = useState(false)
  const [checked, setChecked] = useState(false)

  return (
    <FormControlLabel
      label={label}
      value={value}
      control={
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onChange={() => {
            const result = handler({ checked, indeterminate })

            setIndeterminate(result.indeterminate)
            setChecked(result.checked)
            callback(result, item)
          }}
        />
      }
    />
  )
}

export { RegularItem, type RegularHandlerProps }
