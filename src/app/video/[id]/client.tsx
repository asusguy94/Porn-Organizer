'use client'

import { useEffect, useRef, useState } from 'react'

import { Grid, Card, Typography, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem } from 'rctx-contextmenu'

import Badge from '@components/badge'
import { IconWithText } from '@components/icon'
import { ImageCard } from '@components/image'
import Link from '@components/link'
import ModalComponent, { useModal, ModalHandler, Modal } from '@components/modal'
import { PlyrWithMetadata } from '@components/plyr'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Spinner from '@components/spinner'
import { Header, Player as VideoPlayer, Timeline } from '@components/video'

import { serverConfig } from '@config'
import { Bookmark, Video, VideoStar, SetState, General } from '@interfaces'
import { Attribute, Category, Location } from '@prisma/client'
import { videoService } from '@service'
import { daysToYears } from '@utils/client/date-time'

import styles from './video.module.css'

type VideoPageProps = {
  attributes: Attribute[]
  categories: Category[]
  locations: Location[]
  video: Video
  star: VideoStar | null
  bookmarks: Bookmark[]
}

export default function VideoPage({
  attributes,
  categories,
  locations,
  video: videoData,
  star: starData,
  bookmarks: bookmarksData
}: VideoPageProps) {
  const [video, setVideo] = useState<typeof videoData>() //THROWS ReferenceError: document is not defined (if set directly)
  const [star, setStar] = useState(starData)
  const [bookmarks, setBookmarks] = useState(bookmarksData)

  const { modal, setModal } = useModal()

  useEffect(() => {
    setVideo(videoData)
  }, [videoData])

  return (
    <Grid container>
      <Section
        video={video}
        locations={locations}
        attributes={attributes}
        categories={categories}
        bookmarks={bookmarks}
        star={star}
        update={{ video: setVideo, star: setStar, bookmarks: setBookmarks }}
        onModal={setModal}
        modalData={modal}
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
  locations?: General[]
  attributes?: General[]
  categories?: General[]
  bookmarks: Bookmark[]
  star?: VideoStar | null
  update: {
    video: SetState<Video | undefined>
    star: SetState<VideoStar | null>
    bookmarks: SetState<Bookmark[]>
  }
  onModal: ModalHandler
  modalData: Modal
}
function Section({
  video,
  locations,
  attributes,
  categories,
  bookmarks,
  star = null,
  update,
  onModal,
  modalData
}: SectionProps) {
  const plyrRef = useRef<PlyrWithMetadata | null>(null)
  const playerRef = useRef<HTMLVideoElement>(null)

  // Helper script for getting the player
  const playVideo = (time: number) => {
    const player = plyrRef.current

    if (player !== null) {
      player.currentTime = time
      player.play()
    }
  }

  if (video === undefined) return <Spinner />

  return (
    <Grid item xs={10} component='section'>
      <Header video={video} locations={locations} attributes={attributes} update={update.video} onModal={onModal} />

      <VideoPlayer
        video={video}
        categories={categories}
        bookmarks={bookmarks}
        star={star}
        plyrRef={plyrRef}
        playerRef={playerRef}
        update={update}
        onModal={onModal}
        modalData={modalData}
      />

      <Timeline
        bookmarks={bookmarks}
        video={video}
        categories={categories}
        playVideo={playVideo}
        playerRef={playerRef}
        update={update.bookmarks}
        onModal={onModal}
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
