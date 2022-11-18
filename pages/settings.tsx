import { NextPage } from 'next/types'
import React, { useEffect, useState } from 'react'

import { Button, Checkbox, Grid, List, TextField } from '@mui/material'

import { useLocalStorage } from 'usehooks-ts'

import { IGeneral, ILocalWebsite, ISetState } from '@interfaces'
import { websiteApi } from '@api'

const SettingsPage: NextPage = () => {
  const [websites, setWebsites] = useState<IGeneral[]>([])
  const [rawWebsites, setRawWebsites] = useLocalStorage<ILocalWebsite[]>('websites', [])
  const [localWebsites, setLocalWebsites] = useState<ILocalWebsite[]>([])

  useEffect(() => {
    websiteApi.getAll().then(({ data }) => setWebsites(data))
  }, [])

  useEffect(() => {
    setLocalWebsites(rawWebsites)
  }, [rawWebsites])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // update browser-storage
    setRawWebsites(localWebsites)
  }

  const handleAddWebsite = (wsite: string) => {
    setLocalWebsites(prev => [...prev, { label: wsite, count: 0, finished: true }])
  }

  return (
    <Grid item className='text-center'>
      <WebsiteList
        websites={websites.filter(w => !localWebsites.some(wsite => wsite.label === w.name))}
        addWebsite={handleAddWebsite}
      />
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

interface WebsiteListProps {
  websites: IGeneral[]
  addWebsite: (wsite: string) => void
}
const WebsiteList = ({ websites, addWebsite }: WebsiteListProps) => {
  return (
    <List>
      {websites.map(website => (
        <div key={website.id} onClick={() => addWebsite(website.name)}>
          {`ADD "${website.name}"`}
        </div>
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
