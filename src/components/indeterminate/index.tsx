import { useState } from 'react'

import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material'

export type RegularHandlerProps = {
  checked: boolean
}

export type HandlerProps = {
  checked: boolean
  indeterminate: boolean
}
const handler = ({ checked, indeterminate }: HandlerProps) => {
  if (checked) {
    return { indeterminate: true, checked: false }
  } else if (indeterminate) {
    return { indeterminate: false, checked: false }
  } else {
    return { indeterminate: false, checked: true }
  }
}

type RegularItemProps<T> = {
  label: FormControlLabelProps['label']
  value: string
  item?: T
  callback: (result: RegularHandlerProps, item: T) => void
  defaultChecked?: boolean
}

export function RegularItem<T>({ label, value, item, callback, defaultChecked = false }: RegularItemProps<T>) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <FormControlLabel
      label={label}
      value={value}
      control={
        <Checkbox
          checked={checked}
          onChange={() => {
            setChecked(checked => {
              const status = !checked

              callback({ checked: status }, item as T)
              return !checked
            })
          }}
        />
      }
    />
  )
}

type ItemProps<T> = {
  label: FormControlLabelProps['label']
  value: string
  item?: T
  callback: (result: HandlerProps, item?: T) => void
}

function Item<T>({ label, value, item = undefined, callback }: ItemProps<T>) {
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

export default Item
