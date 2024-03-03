'use client'

import { useEffect, useState } from 'react'

import { Grid, TextField, Card, CardActionArea, CardContent, Button, Typography } from '@mui/material'

import { useSessionStorage } from 'usehooks-ts'

import { ImageCard } from '@components/image'
import Link from '@components/link'
import Spinner from '@components/spinner'

import { serverConfig } from '@config'
import { Missing } from '@interfaces'
import { starService } from '@service'
import { getUnique } from '@utils/shared'

export default function Stars() {
  const [starInput, setStarInput] = useSessionStorage('starInput', '')

  const [input, setInput] = useState('')
  const [activeStar, setActiveStar] = useState<string>()

  const [index, setIndex] = useState(0)

  const { data } = starService.useAll()

  useEffect(() => {
    if (data === undefined) return

    if (data.missing.length) setInput(data.missing[index].name)
  }, [index, data])

  useEffect(() => {
    if (data === undefined) return

    setActiveStar(data.stars.find(s => s.name === starInput)?.name)
  }, [data, starInput])

  if (data === undefined) return <Spinner />

  const missing = getUnique(data.missing, 'name').filter(star => data.stars.every(s => s.name !== star.name))

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (input.length) {
      setStarInput(input)
      starService.add(input).finally(() => {
        location.reload()
      })
    }
  }

  const handleSubmitAll = () => {
    Promise.allSettled(missing.map(missing => starService.add(missing.name))).finally(() => {
      location.reload()
    })
  }

  return (
    <Grid container justifyContent='center'>
      <form onSubmit={handleSubmit}>
        <TextField variant='standard' value={input} onChange={e => setInput(e.currentTarget.value)} />

        <IndexChanger total={missing} index={index} setIndex={setIndex} />

        <Button
          size='small'
          variant='contained'
          color='primary'
          type='submit'
          style={{ marginLeft: 5, marginTop: 1 }}
        >{`Add Star ${missing.length ? `(${index + 1} of ${missing.length})` : ''}`}</Button>

        <Button
          onClick={handleSubmitAll}
          size='small'
          variant='contained'
          color='primary'
          disabled={missing.length === 0}
          style={{ marginLeft: 5, marginTop: 1 }}
        >
          Add all ({missing.length})
        </Button>
      </form>

      <Grid container justifyContent='center' spacing={3} style={{ marginTop: 0 }}>
        {data.stars
          .filter(star => star.image === null)
          .filter(star => star.name.includes(' '))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 12 * 12) // limit results to avoid crash
          .map(star => (
            <Grid item key={star.id} lg={1} md={2} xs={3}>
              <Link href={`/star/${star.id}`}>
                <Card className='text-center'>
                  <CardActionArea>
                    <ImageCard
                      src={`${serverConfig.legacyApi}/star/${star.id}/image`}
                      width={200}
                      height={175}
                      missing={star.image === null}
                      scale={4}
                      alt='star'
                      sizes={`(min-width: 1200px) ${100 / 12}vw, (min-width: 900px) ${100 / 6}vw, ${100 / 4}vw`}
                    />

                    <CardContent style={activeStar === star.name ? { backgroundColor: 'orange' } : {}}>
                      <Typography>{star.name}</Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Link>
            </Grid>
          ))}
      </Grid>

      <Grid container justifyContent='center' spacing={3} style={{ marginTop: 0 }}>
        {data.missing
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 500) // limit results to avoid crash
          .map(star => (
            <Grid item key={star.videoId} lg={1} md={2} xs={3}>
              <Card className='text-center'>
                <CardContent>
                  <Typography>{star.name}</Typography>

                  <CardActionArea>
                    <Link href={`/video/${star.videoId}`}>{star.videoId}</Link>
                  </CardActionArea>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Grid>
  )
}

type IndexChanger = {
  total: Missing[]
  index: number
  setIndex: (index: number) => void
}
function IndexChanger({ total, index, setIndex }: IndexChanger) {
  return (
    <span className='mx-1' style={total.length ? {} : { display: 'none' }}>
      <Button
        variant='outlined'
        onClick={() => setIndex(index - 1)}
        disabled={index <= 0}
        style={{ maxHeight: 30, minWidth: 30 }}
      >
        -
      </Button>

      <span className='d-inline-block mx-1' style={{ verticalAlign: 'middle' }}>
        {index}
      </span>

      <Button
        variant='outlined'
        onClick={() => setIndex(index + 1)}
        disabled={index >= total.length - 1}
        style={{ maxHeight: 30, minWidth: 30 }}
      >
        +
      </Button>
    </span>
  )
}
