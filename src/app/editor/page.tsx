'use client'

import { useState } from 'react'

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

import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import capitalize from 'capitalize'

import Spinner from '@components/spinner'

import { General } from '@interfaces'

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

  const { data } = useQuery({
    queryKey: ['editor', name],
    queryFn: async () => axios.get<General[]>(`/api/${name}`).then(res => res.data)
  })

  const onSubmit = () => {
    setValue('')
    axios.post(`/api/${name}`, { name: value }).then(() => {
      location.reload()
    })
  }

  if (data === undefined) return <Spinner />

  return (
    <Grid item xs={4} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='form' onSubmit={onSubmit}>
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

          <TableBody>{data?.map(item => <TableRow name={name} key={item.id} data={item} />)}</TableBody>
        </MuiTable>
      </TableContainer>
    </Grid>
  )
}

type TableRowProps = {
  data: General
  name: string
}
function TableRow({ data, name }: TableRowProps) {
  const [edit, setEdit] = useState(false)
  const [input, setInput] = useState(data.name)

  const handleSubmit = () => {
    setEdit(false)

    axios.put(`/api/${name}/${data.id}`, { name: input }).then(() => {
      location.reload()
    })
  }

  return (
    <MuiTableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {edit ? (
          <form onSubmit={handleSubmit}>
            <TextField
              name='name'
              variant='standard'
              defaultValue={data.name}
              autoFocus
              onBlur={() => setEdit(false)}
              onChange={e => setInput(e.target.value)}
            />
          </form>
        ) : (
          <span onClick={() => setEdit(true)}>{data.name}</span>
        )}
      </TableCell>
    </MuiTableRow>
  )
}
