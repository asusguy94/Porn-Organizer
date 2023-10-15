import { FormControl, MenuItem, Select, SelectChangeEvent } from '@mui/material'

import capitalize from 'capitalize'

import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import Spinner from '@components/spinner'

import { General } from '@interfaces'

import styles from './filter.module.css'

type FilterObjProps<T extends General> = {
  data?: T[]
  label: string
  callback: (ref: RegularHandlerProps, item: T) => void
  nullCallback?: (ref: RegularHandlerProps) => void
  defaultNull?: boolean
}
export const FilterObj = <T extends General>({
  data,
  label,
  callback,
  nullCallback,
  defaultNull = false
}: FilterObjProps<T>) => {
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
          />
        )}

        {data.map(item => (
          <RegularItem key={item.id} label={item.name} value={item.name} item={item} callback={callback} />
        ))}
      </FormControl>
    </>
  )
}

type FilterDropdownProps = {
  data?: General[]
  label: string
  callback: (e: SelectChangeEvent) => void
}
export const FilterDropdown = ({ data, label, callback }: FilterDropdownProps) => {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <Select variant='standard' id={label} defaultValue='ALL' onChange={callback}>
          <MenuItem value='ALL'>All</MenuItem>

          {data.map(item => (
            <MenuItem key={item.id} value={item.name}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}
