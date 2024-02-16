import { useEffect, useState } from 'react'

import { Button, Checkbox, FormControlLabel, Grid, List, TextField } from '@mui/material'

import axios from 'axios'
import { useLocalStorage } from 'usehooks-ts'

import { serverConfig } from '@/config'
import { General, LocalWebsite, SetState, WebsiteWithCount } from '@/types'
import { clamp } from '@/utils/shared'

export default function SettingsPage() {
  const [websites, setWebistes] = useState<WebsiteWithCount[]>([])
  const [rawWebsites, setRawWebsites] = useLocalStorage<LocalWebsite[]>('websites', [])
  const [localWebsites, setLocalWebsites] = useState<LocalWebsite[]>([])
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    axios.get<WebsiteWithCount[]>(`${serverConfig.api}/website`).then(({ data }) => setWebistes(data))
  }, [])

  useEffect(() => {
    setLocalWebsites(rawWebsites)
  }, [rawWebsites])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // update browser-storage
    setRawWebsites(localWebsites)

    // Reset Changes
    setChanged(false)
  }

  const handleAddWebsite = (wsite: string) => {
    setLocalWebsites(prev => [...prev, { label: wsite, count: 0, finished: false }])

    handleChanged()
  }

  const handleChanged = () => {
    setChanged(true)
  }

  return (
    <Grid item className='text-center'>
      <Grid container justifyContent='center'>
        <Grid item xs={2}>
          <WebsiteList
            websites={websites.filter(website => localWebsites.every(wsite => wsite.label !== website.name))}
            addWebsite={handleAddWebsite}
          />
        </Grid>

        <Grid item xs={5} component='form' onSubmit={handleSubmit}>
          <Grid container item xs={12} alignItems='center'>
            <Grid container item xs={6} spacing={1} justifyContent='center'>
              {localWebsites
                .filter((_, i) => i % 2 === 0)
                .map(wsite => (
                  <Input
                    key={wsite.label}
                    website={wsite}
                    update={setLocalWebsites}
                    localWebsites={localWebsites}
                    max={websites.find(w => w.name === wsite.label)?._count.videos}
                    onChange={handleChanged}
                  />
                ))}
            </Grid>

            <Grid container item xs={6} spacing={1} justifyContent='center'>
              {localWebsites
                .filter((_, i) => i % 2 !== 0)
                .map(wsite => (
                  <Input
                    key={wsite.label}
                    website={wsite}
                    update={setLocalWebsites}
                    localWebsites={localWebsites}
                    max={websites.find(w => w.name === wsite.label)?._count.videos}
                    onChange={handleChanged}
                  />
                ))}
            </Grid>
          </Grid>

          <Button variant='contained' disabled={!changed} type='submit' style={{ marginTop: 10 }}>
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

type WebsiteListProps = {
  websites: General[]
  addWebsite: (wsite: string) => void
}
function WebsiteList({ websites, addWebsite }: WebsiteListProps) {
  return (
    <List style={{ display: 'inline-block' }}>
      {websites.map(website => (
        <div key={website.id} onClick={() => addWebsite(website.name)}>
          {`ADD "${website.name}"`}
        </div>
      ))}
    </List>
  )
}

type InputProps = {
  website: LocalWebsite
  update: SetState<LocalWebsite[]>
  localWebsites: LocalWebsite[]
  max?: number
  onChange: () => void
}
function Input({ website, update, localWebsites, max = 0, onChange }: InputProps) {
  const [count, setCount] = useState(website.count)
  const [finished, setFinished] = useState(website.finished)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = clamp(parseInt(e.target.value), max)

    setCount(value)
    update(
      localWebsites.map(wsite => {
        if (wsite.label === website.label) {
          return { ...wsite, count: value }
        }

        return wsite
      })
    )

    // trigger change
    onChange()
  }

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>, checked: boolean) => {
    setFinished(checked)

    update(
      localWebsites.map(wsite => {
        if (wsite.label === website.label) {
          return { ...wsite, finished: checked }
        }

        return wsite
      })
    )

    // trigger change
    onChange()
  }

  return (
    <Grid item style={{ display: 'flex', gap: 4 }}>
      <TextField label={website.label} type='number' value={count} onChange={handleChange} />

      <FormControlLabel
        label={`finished (${finished ? 'yes' : 'no'})`}
        control={<Checkbox checked={finished} onChange={handleCheck} />}
      />
    </Grid>
  )
}
