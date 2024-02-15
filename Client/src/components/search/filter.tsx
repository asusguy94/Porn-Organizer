import { FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent } from '@mui/material'

import capitalize from 'capitalize'

import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import Spinner from '@components/spinner'

import { DefaultObj } from './sort'

import { useSearchParam } from '@hooks/search'
import { General } from '@interfaces'

import styles from './filter.module.css'

type FilterRadioProps<T extends DefaultObj> = {
  data?: string[]
  label: string & keyof T
  callback: (item: string) => void
  globalCallback?: () => void
  nullCallback?: () => void
  defaultObj: T
}
export function FilterRadio<T extends DefaultObj>({
  data,
  label,
  callback,
  globalCallback,
  nullCallback,
  defaultObj
}: FilterRadioProps<T>) {
  const { currentValue, defaultValue } = useSearchParam(defaultObj, label)

  if (data === undefined) return <Spinner />
  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <RadioGroup name={label} defaultValue={currentValue}>
          {globalCallback !== undefined && (
            <FormControlLabel
              value={defaultValue}
              label={<div className={styles.global}>ALL</div>}
              onChange={globalCallback}
              control={<Radio />}
            />
          )}
          {nullCallback !== undefined && (
            <FormControlLabel
              value='NULL'
              label={<div className={styles.global}>NULL</div>}
              onChange={nullCallback}
              control={<Radio />}
            />
          )}
          {data.map(item => (
            <FormControlLabel
              key={item}
              value={item}
              onChange={() => callback(item)}
              label={item}
              control={<Radio />}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterCheckboxProps<TData extends string | General, TObj extends DefaultObj> = {
  data?: TData[]
  label: string & keyof TObj
  callback: (ref: RegularHandlerProps, item: TData) => void
  nullCallback?: (e: RegularHandlerProps) => void
  defaultNull?: boolean
  defaultObj: TObj
}
export function FilterCheckbox<TData extends string | General, TObj extends DefaultObj>({
  data,
  label,
  callback,
  nullCallback,
  defaultNull = false,
  defaultObj
}: FilterCheckboxProps<TData, TObj>) {
  const { currentValue, defaultValue } = useSearchParam(defaultObj, label)
  const currentArrayValue = currentValue.split(',')

  if (data === undefined) return <Spinner />
  return (
    <>
      <h2>{capitalize(label, true)}</h2>
      <FormControl>
        {nullCallback !== undefined && (
          <RegularItem
            label={<div className={styles.global}>NULL</div>}
            value='NULL'
            callback={nullCallback}
            defaultChecked={defaultNull}
            softDisabled={currentValue !== defaultValue}
          />
        )}
        {data.map(item => {
          const key = typeof item === 'string' ? item : item.id
          const value = typeof item === 'string' ? item : item.name
          return (
            <RegularItem
              key={key}
              label={value}
              value={value}
              item={item}
              callback={callback}
              defaultChecked={currentArrayValue.includes(value)}
              softDisabled={defaultNull}
            />
          )
        })}
      </FormControl>
    </>
  )
}

type FilterDropdownProps<TData extends string | General, TObj extends DefaultObj> = {
  data?: TData[]
  label: string & keyof TObj
  callback: (e: SelectChangeEvent) => void
  defaultObj: TObj
}
export function FilterDropdown<TData extends string | General, TObj extends DefaultObj>({
  data,
  label,
  callback,
  defaultObj
}: FilterDropdownProps<TData, TObj>) {
  const { currentValue } = useSearchParam(defaultObj, label)

  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <Select variant='standard' id={label} defaultValue={currentValue} onChange={callback}>
          <MenuItem value='ALL'>All</MenuItem>

          {data.map(item => {
            const key = typeof item === 'string' ? item : item.id
            const value = typeof item === 'string' ? item : item.name

            return (
              <MenuItem key={key} value={value}>
                {value}
              </MenuItem>
            )
          })}
        </Select>
      </FormControl>
    </>
  )
}

export function isDefault<T extends DefaultObj>(value: string, defaultValue: T[keyof T]) {
  return value === defaultValue
}
