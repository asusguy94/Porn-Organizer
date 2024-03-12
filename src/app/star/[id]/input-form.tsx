import React, { useState, useEffect, Fragment } from 'react'

import { Button, TextField, Grid, Autocomplete } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'

import { IconWithText } from '@/components/icon'
import Spinner from '@/components/spinner'

import styles from './star.module.scss'

type StarInputFormProps = {
  update: (value: string, label: string) => void
  value: string | string[]
  name: string
  list?: string[]
  capitalize?: boolean
  children?: React.ReactNode
  noDropdown?: boolean
  emptyByDefault?: boolean
}
export default function StarInputForm({
  update,
  value,
  name,
  list,
  children,
  capitalize = false,
  noDropdown = false,
  emptyByDefault = false
}: StarInputFormProps) {
  const hasDropdown = !noDropdown

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const updateValue = (value: string) => {
    if (value === '') setOpen(false)

    setInputValue(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!open) {
      update(inputValue, name.toLowerCase())

      if (emptyByDefault) setInputValue('')
    }
  }

  const isChanged =
    inputValue.toLowerCase() !== (typeof value === 'string' && !emptyByDefault ? value : '').toLowerCase()
  const shouldShrink = isChanged || (typeof value === 'string' && value.length > 0)

  useEffect(() => {
    if (!emptyByDefault && typeof value === 'string') {
      setInputValue(value)
    }

    return () => setInputValue('')
  }, [emptyByDefault, value])

  if (hasDropdown && list === undefined) return <Spinner />

  // FIXME excluding an item from dropdown causes a warning
  return (
    <Grid container style={{ marginBottom: 4 }}>
      <Grid item xs={3} component='form' onSubmit={handleSubmit}>
        <Autocomplete
          inputValue={inputValue}
          //
          // EVENTS
          onInputChange={(e, val, reason) => {
            if (reason === 'reset' && !open) return

            updateValue(val)
          }}
          //
          // OPTIONS
          options={list?.filter(item => !(emptyByDefault && value.includes(item))) ?? []}
          renderInput={params => (
            <TextField
              {...params}
              variant='standard'
              label={name}
              color='primary'
              InputLabelProps={{ shrink: shouldShrink, className: styles['no-error'] }}
              className={`${capitalize ? styles.capitalize : ''} ${isChanged ? styles.error : ''}`}
            />
          )}
          autoHighlight
          clearOnBlur={false}
          //
          // open/closed STATUS
          open={open}
          onOpen={() => setOpen(hasDropdown)}
          onClose={() => setOpen(false)}
          //
          // SIMULATE input instead of dropdown
          forcePopupIcon={hasDropdown}
        />
      </Grid>

      <Grid item style={{ marginTop: 14, marginLeft: 8 }}>
        {children}
      </Grid>
    </Grid>
  )
}

type InputFormDataProps = {
  data: string[]
  remove: (name: string) => void
  label: string
}
export function InputFormData({ label, data, remove }: InputFormDataProps) {
  return (
    <>
      {data.map(item => (
        <Fragment key={item}>
          <ContextMenuTrigger id={`${label}-${item}`} className='d-inline-block'>
            <span className={styles.data}>
              <Button size='small' variant='outlined' color='primary'>
                {item}
              </Button>
            </span>
          </ContextMenuTrigger>

          <ContextMenu id={`${label}-${item}`}>
            <IconWithText component={ContextMenuItem} icon='delete' text='Remove' onClick={() => remove(item)} />
          </ContextMenu>
        </Fragment>
      ))}
    </>
  )
}
