import { useState } from 'react'

import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material'

export type RegularHandlerProps = {
  checked: boolean
}

type ItemProps = {
  label: FormControlLabelProps['label']
  value: string
  defaultChecked?: boolean
  disabled?: boolean
  softDisabled?: boolean
}

type WithItemProps<T> = ItemProps & {
  item: T
  callback: (result: RegularHandlerProps, item: T) => void
}

type WithoutItemProps = ItemProps & {
  callback: (result: RegularHandlerProps) => void
}

export default function RegularItem<T>(props: WithItemProps<T> | WithoutItemProps) {
  if ('item' in props) {
    return <RegularWithItem {...props} />
  }

  return <RegularWithoutItem {...props} />
}

function RegularWithItem<T>({
  label,
  value,
  item,
  callback,
  defaultChecked = false,
  disabled,
  softDisabled = false
}: WithItemProps<T>) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <FormControlLabel
      label={label}
      value={value}
      disabled={disabled}
      style={softDisabled ? { opacity: 0.5 } : {}}
      control={
        <Checkbox
          checked={checked}
          onChange={() => {
            setChecked(checked => {
              const status = !checked

              callback({ checked: status }, item)
              return status
            })
          }}
        />
      }
    />
  )
}

function RegularWithoutItem({
  label,
  value,
  callback,
  defaultChecked = false,
  disabled,
  softDisabled = false
}: WithoutItemProps) {
  const [checked, setChecked] = useState(defaultChecked)

  return (
    <FormControlLabel
      label={label}
      value={value}
      disabled={disabled}
      style={softDisabled ? { opacity: 0.5 } : {}}
      control={
        <Checkbox
          checked={checked}
          onChange={() => {
            setChecked(checked => {
              const status = !checked

              callback({ checked: status })
              return status
            })
          }}
        />
      }
    />
  )
}
