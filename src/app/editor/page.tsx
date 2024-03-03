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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import capitalize from 'capitalize'

import Spinner from '@components/spinner'

import createApi from '../../config/api'

import { General } from '@interfaces'
import { mutateAndInvalidate } from '@utils/shared'

import styles from './editor.module.css'

type TableKeys = 'attribute' | 'category' | 'location'

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
  name: TableKeys
}
function Table({ name }: TableProps) {
  const [value, setValue] = useState('')

  const queryClient = useQueryClient()

  const { api } = createApi(`/api/${name}`)

  const { data } = useQuery<General[]>({
    queryKey: [name],
    queryFn: () => api.get('')
  })

  const { mutate } = useMutation<unknown, Error, { name: string }>({
    mutationKey: [name, 'add'],
    mutationFn: payload => api.post('', payload)
  })

  const handleSubmit = () => {
    mutateAndInvalidate({
      mutate,
      queryClient,
      queryKey: [name],
      variables: { name: value }
    })

    setValue('')
  }

  if (data === undefined) return <Spinner />

  return (
    <Grid item xs={4} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='form' onSubmit={handleSubmit}>
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
  name: TableKeys
}
function TableRow({ data, name }: TableRowProps) {
  const [edit, setEdit] = useState(false)
  const [input, setInput] = useState(data.name)

  const queryClient = useQueryClient()

  const { api } = createApi(`/api/${name}`)

  const { mutate } = useMutation<unknown, Error, { name: string }>({
    mutationKey: [name, 'update'],
    mutationFn: payload => api.put(`/${data.id}`, payload)
  })

  const handleSubmit = () => {
    mutateAndInvalidate({
      mutate,
      queryClient,
      queryKey: [name],
      variables: { name: input }
    })

    setEdit(false)
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
