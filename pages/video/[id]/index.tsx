import { NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useEffect, useRef, useState } from 'react'

import { Grid, Card, Typography, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import useSWR from 'swr'

import { ImageCard } from '@components/image'
import Modal, { useModal, type IModalHandler, type IModal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Badge from '@components/badge'
import { Header, Player as VideoPlayer, Timeline } from '@components/video'
import Icon from '@components/icon'
import Link from '@components/link'

import { daysToYears } from '@utils/client/date-time'
import fetcher from '@utils/client/fetcher'

import { videoApi } from '@api'
import { IBookmark as IVideoBookmark, IVideo, IVideoStar, ISetState, IBookmark, IGeneral } from '@interfaces'
import { serverConfig } from '@config'

import styles from './video.module.scss'

const VideoPage: NextPage = () => {
  const { query } = useRouter()

  const { modal, setModal } = useModal()

  const [video, setVideo] = useState<IVideo>()

  const [star, setStar] = useState<IVideoStar | null>()

  const [bookmarks, setBookmarks] = useState<IBookmark[]>([])
  const { data: attributes } = useSWR<IGeneral[]>(`${serverConfig.api}/attribute`, fetcher)
  const { data: categories } = useSWR<IGeneral[]>(`${serverConfig.api}/category`, fetcher)
  const { data: locations } = useSWR<IGeneral[]>(`${serverConfig.api}/location`, fetcher)

  useEffect(() => {
    if (typeof query.id === 'string') {
      const videoID = parseInt(query.id)

      Promise.all([
        videoApi.get<IVideo>(videoID).then(({ data }) => setVideo(data)),
        videoApi.getBookmarks<IBookmark[]>(videoID).then(({ data }) => setBookmarks(data)),
        videoApi.getStar<IVideoStar>(videoID).then(({ data }) => setStar(data !== '' ? data : null))
      ])
    }
  }, [query.id])

  return (
    <Grid container id='video-page'>
      {video !== undefined && star !== undefined && (
        <>
          <Section
            video={video}
            locations={locations ?? []}
            attributes={attributes ?? []}
            categories={categories ?? []}
            bookmarks={bookmarks}
            star={star}
            update={{ video: setVideo, star: setStar, bookmarks: setBookmarks }}
            onModal={setModal}
            modalData={modal}
          />

          <Grid item xs={2} id={styles.sidebar}>
            <div id={styles.stars}>
              {star !== null && <Star video={video} star={star} update={setStar} />}

              <StarInput video={video} disabled={star !== null} update={setStar} />
            </div>
          </Grid>
        </>
      )}

      <Modal visible={modal.visible} title={modal.title} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </Modal>
    </Grid>
  )
}

interface SectionProps {
  video: IVideo
  locations: IGeneral[]
  attributes: IGeneral[]
  categories: IGeneral[]
  bookmarks: IVideoBookmark[]
  star: IVideoStar | null
  update: {
    video: ISetState<IVideo | undefined>
    star: ISetState<IVideoStar | undefined | null>
    bookmarks: ISetState<IBookmark[]>
  }
  onModal: IModalHandler
  modalData: IModal
}
const Section = ({
  video,
  locations,
  attributes,
  categories,
  bookmarks,
  star,
  update,
  onModal,
  modalData
}: SectionProps) => {
  const [duration, setDuration] = useState(0)
  const plyrRef = useRef<HTMLVideoElement>()

  // Helper script for getting the player
  const playVideo = (time: number) => {
    const player = plyrRef.current

    if (player !== undefined) {
      player.currentTime = time
      player.play()
    }
  }

  return (
    <Grid item xs={10}>
      <Header video={video} locations={locations} attributes={attributes} update={update.video} onModal={onModal} />

      <VideoPlayer
        video={video}
        categories={categories}
        bookmarks={bookmarks}
        star={star}
        plyrRef={plyrRef}
        updateDuration={setDuration}
        update={update}
        onModal={onModal}
        modalData={modalData}
      />

      <Timeline
        bookmarks={bookmarks}
        video={video}
        categories={categories}
        playVideo={playVideo}
        duration={duration}
        update={update.bookmarks}
        onModal={onModal}
      />
    </Grid>
  )
}

interface StarProps {
  star: IVideoStar
  video: IVideo
  update: ISetState<IVideoStar | null | undefined>
}
const Star = ({ star, video, update }: StarProps) => {
  const removeStarHandler = () => {
    videoApi.removeStar(video.id).then(() => {
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

interface StarInputProps {
  video: IVideo
  update: ISetState<IVideoStar | null | undefined>
  disabled?: boolean
}
const StarInput = ({ video, update, disabled = false }: StarInputProps) => {
  const addStar = (star: string) => {
    videoApi.addStar(video.id, star).then(({ data }) => update(data))
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
