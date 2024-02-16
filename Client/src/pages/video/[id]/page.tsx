import { useEffect, useRef, useState } from 'react'

import { Grid, Card, Typography, TextField } from '@mui/material'

import axios from 'axios'
import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import Badge from '@/components/badge'
import { IconWithText } from '@/components/icon'
import { ImageCard } from '@/components/image'
import ModalComponent, { useModal, ModalHandler, Modal } from '@/components/modal'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import Spinner from '@/components/spinner'
import { Header, Player as VideoPlayer, Timeline } from '@/components/video'
import { MediaPlayerInstance } from '@/components/vidstack'
import { serverConfig } from '@/config'
import { videoService } from '@/service'
import { Bookmark, Video, VideoStar, SetState, General } from '@/types'
import { daysToYears } from '@/utils/client/date-time'
import validate, { z } from '@/utils/client/validation'

import styles from './video.module.css'

export default function VideoPage() {
  const params = useParams<{ id: string }>()
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const [video, setVideo] = useState<Video>()
  const [star, setStar] = useState<VideoStar | null>(null)

  useEffect(() => {
    axios.get<{ video: Video; star: VideoStar | null }>(`${serverConfig.api}/video/${id}`).then(({ data }) => {
      setVideo(data.video)
      setStar(data.star)
    })
  }, [id])

  const { modal, setModal } = useModal()

  return (
    <Grid container>
      <Section
        video={video}
        star={star}
        update={{ video: setVideo, star: setStar }}
        modal={{ data: modal, handler: setModal }}
      />

      <Grid item xs={2} id={styles.sidebar} component='aside'>
        <div id={styles.stars}>
          {video !== undefined && (
            <>
              {star !== null && <Star video={video} star={star} update={setStar} />}

              <StarInput video={video} disabled={star !== null} update={setStar} />
            </>
          )}
        </div>
      </Grid>

      <ModalComponent visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </ModalComponent>
    </Grid>
  )
}

type SectionProps = {
  video?: Video
  star?: VideoStar | null
  update: {
    video: SetState<Video | undefined>
    star: SetState<VideoStar | null>
  }
  modal: { data: Modal; handler: ModalHandler }
}
function Section({ video, star = null, update, modal }: SectionProps) {
  const [params] = useSearchParams()
  const { id } = validate(z.object({ id: z.coerce.number() }), { id: params.get('id') })

  const [categories, setCategories] = useState<General[]>([])
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  useEffect(() => {
    axios.get<General[]>(`${serverConfig.api}/category`).then(({ data }) => setCategories(data))
  }, [])

  useEffect(() => {
    axios.get<Bookmark[]>(`${serverConfig.api}/video/${id}/bookmark`).then(({ data }) => setBookmarks(data))
  }, [id])

  const playerRef = useRef<MediaPlayerInstance>(null)

  // Helper script for getting the player
  const playVideo = (time: number) => {
    const player = playerRef.current

    if (player !== null) {
      player.currentTime = time
      player.play()
    }
  }

  if (video === undefined) return <Spinner />

  return (
    <Grid item xs={10} component='section'>
      <Header video={video} update={update.video} onModal={modal.handler} />

      <VideoPlayer
        video={video}
        categories={categories}
        bookmarks={bookmarks}
        star={star}
        playerRef={playerRef}
        update={{ ...update, bookmarks: setBookmarks }}
        modal={modal}
      />

      <Timeline
        bookmarks={bookmarks}
        video={video}
        categories={categories}
        playVideo={playVideo}
        playerRef={playerRef}
        update={setBookmarks}
        onModal={modal.handler}
      />
    </Grid>
  )
}

type StarProps = {
  star: VideoStar
  video: Video
  update: SetState<VideoStar | null>
}
function Star({ star, video, update }: StarProps) {
  const removeStarHandler = () => {
    videoService.removeStar(video.id).then(() => {
      update(null)
    })
  }

  return (
    <div className={styles.star}>
      <RibbonContainer component={Card}>
        <Badge content={star.numVideos}>
          <ContextMenuTrigger id='star'>
            <ImageCard
              src={`${serverConfig.api}/star/${star.id}/image`}
              width={250}
              height={380}
              missing={star.image === null}
              renderStyle='transform'
              scale={5}
              responsive
            />

            <Link to={`/star/${star.id}`}>
              <Typography className='unselectable'>{star.name}</Typography>
            </Link>

            {star.ageInVideo > 0 && <Ribbon label={daysToYears(star.ageInVideo)} />}
          </ContextMenuTrigger>
        </Badge>
      </RibbonContainer>

      <ContextMenu id='star'>
        <IconWithText component={ContextMenuItem} icon='delete' text='Remove' onClick={removeStarHandler} />
      </ContextMenu>
    </div>
  )
}

type StarInputProps = {
  video: Video
  update: SetState<VideoStar | null>
  disabled?: boolean
}
function StarInput({ video, update, disabled = false }: StarInputProps) {
  const addStar = (star: string) => {
    videoService.addStar(video.id, star).then(({ data }) => update(data))
  }

  if (disabled) return null

  return (
    <TextField
      label='Star'
      variant='outlined'
      autoFocus
      onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
          addStar((e.target as HTMLInputElement).value)
        }
      }}
    />
  )
}
