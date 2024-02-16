import { useMemo, useRef, useState } from 'react'

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

import { General } from '@/types'

import styles from './editor.module.css'

export default function EditorPage() {
  return (
    <Grid container>
      <Table name='attribute' />
      <Table name='category' />
      <Table name='location' />
    </Grid>
  )
}

type TableProps = {
  name: string
}
function Table({ name }: TableProps) {
  const [value, setValue] = useState('')

  const data: General[] = useMemo(() => [], [])

  return (
    <Grid item xs={4} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='form' onSubmit={() => setValue('')}>
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
              <TableRow key={item.id} data={item} />
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Grid>
  )
}

type TableRowProps = {
  data: General
}
function TableRow({ data }: TableRowProps) {
  const ref = useRef<HTMLFormElement>(null)
  const [edit, setEdit] = useState(false)

  return (
    <MuiTableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {edit ? (
          <form ref={ref} onSubmit={() => setEdit(false)}>
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
