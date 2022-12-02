import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import { Grid, TextField, Card, CardActionArea, CardContent, Button, Typography } from '@mui/material'

import { useSessionStorage } from 'usehooks-ts'

import Link from '@components/link'
import { ImageCard } from '@components/image'

import { starApi } from '@api'
import { serverConfig } from '@config'
import { getUnique } from '@utils/shared'

interface IStar {
  id: number
  name: string
  image: string | null
}

interface IMissing {
  videoID: number
  name: string
}

interface IIndexChanger {
  total: IMissing[]
  index: number
  setIndex: (index: number) => void
}
const IndexChanger = ({ total, index, setIndex }: IIndexChanger) => (
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

const Stars: NextPage = () => {
  const [starInput, setStarInput] = useSessionStorage('starInput', '')

  const [missing, setMissing] = useState<IMissing[]>([])
  const [stars, setStars] = useState<IStar[]>([])
  const [videoStars, setVideoStars] = useState<IMissing[]>([])

  const [input, setInput] = useState('')
  const [activeStar, setActiveStar] = useState<string>()

  const [index, setIndex] = useState(0)

  useEffect(() => {
    starApi.getMissing<IStar, IMissing>().then(({ data }) => {
      const filtered = getUnique(data.missing, 'name').filter(star => !data.stars.some(s => s.name === star.name))

      setStars(data.stars)
      setMissing(filtered)
      setVideoStars(data.missing)
    })
  }, [])

  useEffect(() => {
    if (missing.length) setInput(missing[index].name)
  }, [missing, index])

  useEffect(() => {
    setActiveStar(stars.find(s => s.name === starInput)?.name)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stars])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (input.length) {
      setStarInput(input)
      starApi.add(input).finally(() => {
        window.location.reload()
      })
    }
  }

  const handleSubmitAll = () => {
    Promise.allSettled(missing.map(m => starApi.add(m.name))).finally(() => {
      window.location.reload()
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
          .filter(s => s.image === null)
          .filter(s => s.name.includes(' '))
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 12 * 12) // limit results to avoid crash
          .map(star => (
            <Grid item key={star.id} lg={1} md={2} xs={3}>
              <Link href={{ pathname: '/star/[id]', query: { id: star.id } }}>
                <Card className='text-center'>
                  <CardActionArea>
                    <ImageCard
                      src={`${serverConfig.api}/star/${star.id}/image`}
                      width={200}
                      height={175}
                      missing={star.image === null}
                      scale={4}
                      alt='star'
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
            <Grid item key={star.videoID} lg={1} md={2} xs={3}>
              <Card className='text-center'>
                <CardContent>
                  <Typography>{star.name}</Typography>

                  <CardActionArea>
                    <Link href={{ pathname: '/video/[id]', query: { id: star.videoID } }}>{star.videoID}</Link>
                  </CardActionArea>
                </CardContent>
              </Card>
            </Grid>
          ))}
      </Grid>
    </Grid>
  )
}

export default Stars
