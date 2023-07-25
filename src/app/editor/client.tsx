'use client'

import { NextPage } from 'next/types'
import { useRef, useState } from 'react'

import {
  Grid,
  Button,
  Table as MuiTable,
  TableContainer,
  TableHead,
  TableRow as MuiTableRow,
  TableCell,
  TableBody,
  TextField,
  Paper
} from '@mui/material'

import capitalize from 'capitalize'

import { General, ServerAction } from '@interfaces'

import styles from './editor.module.scss'

export type EditorPageProps = {
  data: { name: string; data: General[]; add: ServerAction; update: ServerAction }[]
}

const EditorPage: NextPage<EditorPageProps> = ({ data }) => (
  <Grid container>
    {data.map(item => (
      <Table key={item.name} {...item} />
    ))}
  </Grid>
)

type TableProps = {
  name: string
  data: General[]
  add: ServerAction
  update: ServerAction
}
const Table = ({ name, data, add, update }: TableProps) => {
  const [value, setValue] = useState('')

  return (
    <Grid item xs={4} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='form' action={add} onSubmit={() => setValue('')}>
          <TextField
            variant='standard'
            name='name'
            label={capitalize(name)}
            value={value}
            onChange={e => setValue(e.target.value)}
            style={{ marginLeft: 5, marginRight: 5 }}
          />

          <Button type='submit' variant='contained' color='primary' size='small' style={{ marginTop: 2 }}>
            Add {name}
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} style={{ overflowX: 'visible' }}>
        <MuiTable size='small' className={styles['table-striped']} stickyHeader>
          <TableHead>
            <MuiTableRow>
              <TableCell>ID</TableCell>
              <TableCell>{capitalize(name)}</TableCell>
            </MuiTableRow>
          </TableHead>

          <TableBody>
            {data.map(item => (
              <TableRow key={item.id} data={item} update={update} />
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Grid>
  )
}

type TableRowProps = {
  update: ServerAction
  data: General
}
const TableRow = ({ update, data }: TableRowProps) => {
  const ref = useRef<HTMLFormElement>(null)
  const [edit, setEdit] = useState(false)

  return (
    <MuiTableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {edit ? (
          <form ref={ref} action={update} onSubmit={() => setEdit(false)}>
            <input type='hidden' name='id' value={data.id} readOnly />
            <TextField
              name='name'
              variant='standard'
              defaultValue={data.name}
              autoFocus
              onBlur={() => setEdit(false)}
            />
          </form>
        ) : (
          <span onClick={() => setEdit(true)}>{data.name}</span>
        )}
      </TableCell>
    </MuiTableRow>
  )
}

export default EditorPage
