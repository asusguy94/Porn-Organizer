import { NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'

import {
  Grid,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  Paper
} from '@mui/material'

import axios from 'axios'
import capitalize from 'capitalize'

import { General } from '@interfaces'
import { serverConfig } from '@config'

import styles from './editor.module.scss'

const EditorPage: NextPage = () => (
  <Grid container>
    <Wrapper label='attributes' name='attribute' />
    <Wrapper label='categories' name='category' />
    <Wrapper label='locations' name='location' />
  </Grid>
)

type WrapperProps = {
  label: string
  name: string
}
const Wrapper = ({ label, name }: WrapperProps) => {
  const router = useRouter()

  const [input, setInput] = useState('')

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.currentTarget.value)

  const handleSubmit = () => {
    if (input.length) {
      if (input.toLowerCase() === input) return false

      axios.post(`${serverConfig.api}/${name}`, { name: input }).then(() => {
        router.reload()
      })
    }
  }

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Grid item xs={4} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='h2'>
          {capitalize(label)}
        </Grid>

        <Grid item>
          <TextField
            variant='standard'
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            style={{ marginLeft: 5, marginRight: 5 }}
          />

          <Button variant='contained' color='primary' size='small' onClick={handleSubmit} style={{ marginTop: 2 }}>
            Add {capitalize(name)}
          </Button>
        </Grid>
      </Grid>

      <WrapperItem label={name} />
    </Grid>
  )
}

type WrapperItemProps = {
  label: string
}
const WrapperItem = ({ label }: WrapperItemProps) => {
  const [data, setData] = useState<General[]>([])

  const updateItem = (ref: General, value: string) => {
    axios.put(`${serverConfig.api}/${label}/${ref.id}`, { value }).then(() => {
      setData(
        data.map(item => ({
          ...item,
          name: ref.id === item.id ? value : item.name
        }))
      )
    })
  }

  useEffect(() => {
    const abortController = new AbortController()

    axios
      .get<General[]>(`${serverConfig.api}/${label}`, {
        signal: abortController.signal
      })
      .then(({ data }) => {
        setData(data.sort((a, b) => a.id - b.id))
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          setData([])
        }
      })

    return () => abortController.abort()
  }, [label])

  return (
    <TableContainer component={Paper} style={{ overflowX: 'visible' }}>
      <Table size='small' className={styles['table-striped']} stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{capitalize(label)}</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map(item => (
            <Item key={item.id} data={item} update={updateItem} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

type ItemProps = {
  update: (ref: General, value: string) => void
  data: General
}
const Item = ({ update, data }: ItemProps) => {
  const [edit, setEdit] = useState(false)
  const [value, setValue] = useState('')

  const save = () => {
    setEdit(false)

    if (value.length) update(data, value)
  }

  return (
    <TableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {edit ? (
          <TextField
            variant='standard'
            defaultValue={data.name}
            autoFocus
            onBlur={save}
            onKeyPress={e => {
              if (e.key === 'Enter') {
                save()
              }
            }}
            onChange={e => setValue(e.currentTarget.value)}
          />
        ) : (
          <span onClick={() => setEdit(true)}>{data.name}</span>
        )}
      </TableCell>
    </TableRow>
  )
}

export default EditorPage
