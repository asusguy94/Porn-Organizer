import { NextPage } from 'next/types'
import React, { useEffect, useState } from 'react'

import { Button, Checkbox, Grid, List, TextField } from '@mui/material'

import { useLocalStorage } from 'usehooks-ts'
import useSWR from 'swr'

import { IGeneral, ILocalWebsite, ISetState } from '@interfaces'
import { serverConfig } from '@config'

const SettingsPage: NextPage = () => {
  const { data: websites } = useSWR<IGeneral[]>(`${serverConfig.api}/website`)
  const [rawWebsites, setRawWebsites] = useLocalStorage<ILocalWebsite[]>('websites', [])
  const [localWebsites, setLocalWebsites] = useState<ILocalWebsite[]>([])

  useEffect(() => {
    setLocalWebsites(rawWebsites)
  }, [rawWebsites])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setRawWebsites(localWebsites)
  }

  // list all available websites
  // add website to form if clicked
  // remove-button next to form

  return (
    <Grid item className='text-center'>
      <WebsiteList websites={(websites ?? []).filter(w => !localWebsites.some(wsite => wsite.label === w.name))} />
      <form onSubmit={handleSubmit}>
        <Grid container alignItems='center' direction='column' justifyContent='center' spacing={1}>
          {localWebsites.map(wsite => (
            <Input key={wsite.label} website={wsite} update={setLocalWebsites} localWebsites={localWebsites} />
          ))}
        </Grid>

        <Button variant='contained' type='submit' style={{ marginTop: 10 }}>
          Save Changes
        </Button>
      </form>
    </Grid>
  )
}

const WebsiteList = ({ websites }: { websites: IGeneral[] }) => {
  return (
    <List>
      {websites.map(website => (
        <div key={website.id}>{website.name}</div>
      ))}
    </List>
  )
}

interface InputProps {
  website: ILocalWebsite
  update: ISetState<ILocalWebsite[]>
  localWebsites: ILocalWebsite[]
}
const Input = ({ website, update, localWebsites }: InputProps) => {
  const [count, setCount] = useState(website.count)
  const [finished, setFinished] = useState(website.finished)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    const count = value < 0 ? 0 : value

    setCount(count)
    update(
      localWebsites.map(wsite => {
        if (wsite.label === website.label) {
          wsite.count = count
        }

        return wsite
      })
    )
  }

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFinished(checked)

    update(
      localWebsites.map(wsite => {
        if (wsite.label === website.label) {
          wsite.finished = checked

          console.log(wsite)
        }

        return wsite
      })
    )
  }

  return (
    <Grid item>
      <TextField
        id={`${website.label.toLowerCase()}-input`}
        name={website.label.toLowerCase()}
        label={website.label}
        type='number'
        value={count}
        onChange={handleChange}
      />

      <Checkbox checked={finished} onChange={handleCheck} />

      <span>finished ({finished ? 'yes' : 'no'})</span>
    </Grid>
  )
}

export default SettingsPage
