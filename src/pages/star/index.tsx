import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useState, useEffect } from 'react'

import { Grid, TextField, Card, CardActionArea, CardContent, Button, Typography } from '@mui/material'

import { useSessionStorage } from 'usehooks-ts'

import Link from '@components/link'
import { ImageCard } from '@components/image'

import { starService } from '@service'
import { serverConfig } from '@config'
import { getUnique } from '@utils/shared'
import prisma from '@utils/server/prisma'
import { generateStarName } from '@utils/server/generate'

export const getServerSideProps: GetServerSideProps<{
  stars: {
    id: number
    name: string
    image: string | null
  }[]
  missing: {
    videoId: number
    name: string
  }[]
}> = async () => {
  const stars = await prisma.star.findMany({
    select: { id: true, name: true, image: true },
    where: {
      OR: [
        { image: null }, // without image
        {
          // without profile data
          breast: null,
          haircolor: null,
          ethnicity: null,
          birthdate: null,
          height: null,
          weight: null
        },
        { autoTaggerIgnore: true }, // disabled profile
        { api: null } // missing profile
      ]
    }
  })

  // VideoStars Without STAR
  const missing = (await prisma.video.findMany({ where: { star: null } })).map(v => ({
    videoId: v.id,
    name: generateStarName(v.path)
  }))

  return { props: { stars, missing } }
}

const Stars: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ stars, missing: videoStars }) => {
  const router = useRouter()

  const [starInput, setStarInput] = useSessionStorage('starInput', '')

  const [input, setInput] = useState('')
  const [activeStar, setActiveStar] = useState<string>()

  const [index, setIndex] = useState(0)

  const missing = getUnique(videoStars, 'name').filter(star => !stars.some(s => s.name === star.name))

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
        router.reload()
      })
    }
  }

  const handleSubmitAll = () => {
    Promise.allSettled(missing.map(m => starService.add(m.name))).finally(() => {
      router.reload()
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
        {videoStars
          .sort((a, b) => a.name.localeCompare(b.name))
          .slice(0, 500) // limit results to avoid crash
          .map(star => (
            <Grid item key={star.videoId} lg={1} md={2} xs={3}>
              <Card className='text-center'>
                <CardContent>
                  <Typography>{star.name}</Typography>

                  <CardActionArea>
                    <Link href={{ pathname: '/video/[id]', query: { id: star.videoId } }}>{star.videoId}</Link>
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
  total: InferGetServerSidePropsType<typeof getServerSideProps>['missing']
  index: number
  setIndex: (index: number) => void
}
const IndexChanger = ({ total, index, setIndex }: IndexChanger) => (
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

export default Stars
