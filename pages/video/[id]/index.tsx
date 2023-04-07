import { NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { Grid, Card, Typography, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

import { ImageCard } from '@components/image'
import ModalComponent, { useModal, type ModalHandler, type Modal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Badge from '@components/badge'
import { Header, Player as VideoPlayer, Timeline } from '@components/video'
import Icon from '@components/icon'
import Link from '@components/link'
import Spinner from '@components/spinner'
import { PlyrWithMetadata } from '@components/plyr'

import { Bookmark as VideoBookmark, Video, VideoStar, SetState, Bookmark, General } from '@interfaces'
import { attributeService, categoryService, locationService, videoService } from '@service'
import { serverConfig } from '@config'
import { daysToYears } from '@utils/client/date-time'

import styles from './video.module.scss'

const VideoPage: NextPage = () => {
  const { query, isReady } = useRouter()

  const { data: attributes } = attributeService.useAttributes()
  const { data: categories } = categoryService.useCategories()
  const { data: locations } = locationService.useLocations()

  const videoID = isReady && typeof query.id === 'string' ? parseInt(query.id) : undefined
  const { data: videoData } = videoService.useVideo<Video>(videoID)
  const { data: starData } = videoService.useStar(videoID)
  const { data: bookmarksData } = videoService.useBookmarks<Bookmark[]>(videoID)

  const [video, setVideo] = useState<Video>()
  const [star, setStar] = useState<VideoStar | null>()
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([])

  const { modal, setModal } = useModal()

  useEffect(() => {
    setVideo(videoData)
  }, [videoData])

  useEffect(() => {
    if (starData !== undefined) {
      setStar(starData)
    }
  }, [starData])

  useEffect(() => {
    if (bookmarksData !== undefined) {
      setBookmarks(bookmarksData)
    }
  }, [bookmarksData])

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

      <Grid item xs={2} id={styles.sidebar}>
        <div id={styles.stars}>
          {star !== undefined ? (
            video !== undefined && (
              <>
                {star !== null && <Star video={video} star={star} update={setStar} />}

                <StarInput video={video} disabled={star !== null} update={setStar} />
              </>
            )
          ) : (
            <Spinner />
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
  bookmarks: VideoBookmark[]
  star?: VideoStar | null
  update: {
    video: SetState<Video | undefined>
    star: SetState<VideoStar | null | undefined>
    bookmarks: SetState<Bookmark[]>
  }
  onModal: ModalHandler
  modalData: Modal
}
const Section = ({
  video,
  locations,
  attributes,
  categories,
  bookmarks,
  star = null,
  update,
  onModal,
  modalData
}: SectionProps) => {
  const plyrRef = useRef<PlyrWithMetadata | null>(null)

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
    <Grid item xs={10}>
      <Header video={video} locations={locations} attributes={attributes} update={update.video} onModal={onModal} />

      <VideoPlayer
        video={video}
        categories={categories}
        bookmarks={bookmarks}
        star={star}
        plyrRef={plyrRef}
        update={update}
        onModal={onModal}
        modalData={modalData}
      />

      <Timeline
        bookmarks={bookmarks}
        video={video}
        categories={categories}
        playVideo={playVideo}
        update={update.bookmarks}
        onModal={onModal}
      />
    </Grid>
  )
}

type StarProps = {
  star: VideoStar
  video: Video
  update: SetState<VideoStar | null | undefined>
}
const Star = ({ star, video, update }: StarProps) => {
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

            <Link href={{ pathname: '/star/[id]', query: { id: star.id } }}>
              <Typography className='unselectable'>{star.name}</Typography>
            </Link>

            {star.ageInVideo > 0 && <Ribbon label={daysToYears(star.ageInVideo)} />}
          </ContextMenuTrigger>
        </Badge>
      </RibbonContainer>

      <ContextMenu id='star'>
        <MenuItem onClick={removeStarHandler}>
          <Icon code='trash' /> Remove
        </MenuItem>
      </ContextMenu>
    </div>
  )
}

type StarInputProps = {
  video: Video
  update: SetState<VideoStar | null | undefined>
  disabled?: boolean
}
const StarInput = ({ video, update, disabled = false }: StarInputProps) => {
  const addStar = (star: string) => {
    videoService.addStar(video.id, star).then(({ data }) => update(data))
  }

  if (disabled) return null

  return (
    <TextField
      label='Star'
      variant='outlined'
      autoFocus
      onKeyDown={e => {
        if (e.key === 'Enter') {
          addStar((e.target as HTMLInputElement).value)
        }
      }}
    />
  )
}

export default VideoPage
