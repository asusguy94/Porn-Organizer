import { useState, useEffect } from 'react'

import { Grid, TextField, Card, CardActionArea, CardContent, Button, Typography } from '@mui/material'

import axios from 'axios'
import { Link } from 'react-router-dom'
import { useSessionStorage } from 'usehooks-ts'

import { ImageCard } from '@/components/image'
import { serverConfig } from '@/config'
import { starService } from '@/service'
import { getUnique } from '@/utils/shared'

type Missing = { videoId: number; name: string }

export default function Stars() {
  const [stars, setStars] = useState<{ id: number; name: string; image: string | null }[]>([])
  const [videoStars, setVideoStars] = useState<Missing[]>([])

  useEffect(() => {
    axios.get<{ stars: typeof stars; missing: typeof videoStars }>(`${serverConfig.api}/star`).then(({ data }) => {
      setStars(data.stars)
      setVideoStars(data.missing)
    })
  }, [])

  const [starInput, setStarInput] = useSessionStorage('starInput', '')

  const [input, setInput] = useState('')
  const [activeStar, setActiveStar] = useState<string>()

  const [index, setIndex] = useState(0)

  const missing = getUnique(videoStars, 'name').filter(star => stars.every(s => s.name !== star.name))

  useEffect(() => {
    if (missing.length) setInput(missing[index].name)
  }, [missing, index])

  useEffect(() => {
    setActiveStar(stars.find(s => s.name === starInput)?.name)
  }, [starInput, stars])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (input.length) {
      setStarInput(input)
      starService.add(input).finally(() => {
        location.reload()
        // setInput('')
      })
    }
  }

  const handleSubmitAll = () => {
    Promise.allSettled(missing.map(missing => starService.add(missing.name))).finally(() => {
      location.reload()
      // setInput('')
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
        {stars
          .filter(star => star.image === null)
          .filter(star => star.name.includes(' '))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 12 * 12) // limit results to avoid crash
          .map(star => (
            <Grid item key={star.id} lg={1} md={2} xs={3}>
              <Link to={`/star/${star.id}`}>
                <Card className='text-center'>
                  <CardActionArea>
                    <ImageCard
                      src={`${serverConfig.api}/star/${star.id}/image`}
                      width={200}
                      height={175}
                      missing={star.image === null}
                      scale={4}
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
        {videoStars
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 500) // limit results to avoid crash
          .map(star => (
            <Grid item key={star.videoId} lg={1} md={2} xs={3}>
              <Card className='text-center'>
                <CardContent>
                  <Typography>{star.name}</Typography>

                  <CardActionArea>
                    <Link to={`/video/${star.videoId}`}>{star.videoId}</Link>
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
