'use client'

import { useParams } from 'next/navigation'
import { useRef } from 'react'

import { Grid, Card, Typography, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Badge from '@/components/badge'
import { IconWithText } from '@/components/icon'
import { ImageCard } from '@/components/image'
import Link from '@/components/link'
import ModalComponent, { useModal, ModalHandler, Modal } from '@/components/modal'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import Spinner from '@/components/spinner'
import { Header, Player as VideoPlayer, Timeline } from '@/components/video'
import { MediaPlayerInstance } from '@/components/vidstack'

import { serverConfig } from '@/config'
import { Video, VideoStar } from '@/interface'
import { categoryService, videoService } from '@/service'
import { daysToYears } from '@/utils/client/date-time'
import validate, { z } from '@/utils/server/validation'

import styles from './video.module.css'

export default function VideoPage() {
  const params = useParams()
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { data: video } = videoService.useVideo(id)
  const { data: star } = videoService.useStar(id)

  const { modal, setModal } = useModal()

  if (video === undefined || star === undefined) return <Spinner />

  return (
    <Grid container>
      <Section video={video} star={star} modal={{ data: modal, handler: setModal }} />

      <Grid item xs={2} id={styles.sidebar} component='aside'>
        <div id={styles.stars}>
          {star !== null && <Star video={video} star={star} />}

          <StarInput video={video} disabled={star !== null} />
        </div>
      </Grid>

      <ModalComponent visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </ModalComponent>
    </Grid>
  )
}

type SectionProps = {
  video: Video
  star: VideoStar | null
  modal: { data: Modal; handler: ModalHandler }
}
function Section({ video, star = null, modal }: SectionProps) {
  const playerRef = useRef<MediaPlayerInstance>(null)
  const { data: categories } = categoryService.useAll()
  const { data: bookmarks } = videoService.useBookmarks(video.id)

  // Helper script for getting the player
  const playVideo = (time: number) => {
    const player = playerRef.current

    if (player !== null) {
      player.currentTime = time
      player.play()
    }
  }

  if (categories === undefined || bookmarks === undefined) return <Spinner />

  return (
    <Grid item xs={10} component='section'>
      <Header video={video} onModal={modal.handler} />

      <VideoPlayer
        video={video}
        categories={categories}
        bookmarks={bookmarks}
        star={star}
        playerRef={playerRef}
        modal={modal}
      />

      <Timeline
        bookmarks={bookmarks}
        video={video}
        categories={categories}
        playVideo={playVideo}
        playerRef={playerRef}
        onModal={modal.handler}
      />
    </Grid>
  )
}

type StarProps = {
  star: VideoStar
  video: Video
}
function Star({ star, video }: StarProps) {
  const removeStarHandler = () => {
    videoService.removeStar(video.id).then(() => {
      location.reload()
    })
  }

  return (
    <div className={styles.star}>
      <RibbonContainer component={Card}>
        <Badge content={star.numVideos}>
          <ContextMenuTrigger id='star'>
            <ImageCard
              src={`${serverConfig.newApi}/star/${star.id}/image`}
              width={250}
              height={380}
              missing={star.image === null}
              renderStyle='transform'
              scale={5}
              alt='star'
              priority
              responsive
              sizes={`${(100 / 12) * 2}vw`}
            />

            <Link href={`/star/${star.id}`}>
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
  disabled?: boolean
}
function StarInput({ video, disabled = false }: StarInputProps) {
  const addStar = (star: string) => {
    videoService.addStar(video.id, star).then(() => {
      location.reload()
    })
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
