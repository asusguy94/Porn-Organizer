import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useEffect, useRef, useState } from 'react'

import { Grid, Card, Typography, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, ContextMenuItem as MenuItem } from 'rctx-contextmenu'

import { ImageCard } from '@components/image'
import ModalComponent, { useModal, ModalHandler, Modal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Badge from '@components/badge'
import { Header, Player as VideoPlayer, Timeline } from '@components/video'
import { IconWithText } from '@components/icon'
import Link from '@components/link'
import Spinner from '@components/spinner'
import { PlyrWithMetadata } from '@components/plyr'

import { Bookmark as VideoBookmark, Video, VideoStar, SetState, Bookmark, General } from '@interfaces'
import { videoService } from '@service'
import { serverConfig } from '@config'
import { daysToYears } from '@utils/client/date-time'

import styles from './video.module.scss'
import prisma from '@utils/server/prisma'
import { Attribute, Category, Location } from '@prisma/client'
import { dateDiff, formatDate, generateHash, validateHash } from '@utils/server/helper'
import { getSceneData } from '@utils/server/metadata'
import { generateStarName } from '@utils/server/generate'

export const getServerSideProps: GetServerSideProps<
  {
    attributes: Attribute[]
    categories: Category[]
    locations: Location[]
    video: Video
    star: VideoStar | null
    bookmarks: Bookmark[]
  },
  { id: string }
> = async context => {
  const id = context.params?.id
  if (id === undefined) throw new Error("'id' is missing")

  const attributes = await prisma.attribute.findMany()
  const categories = await prisma.category.findMany()
  const locations = await prisma.location.findMany()

  const bookmarks = await prisma.bookmark.findMany({
    select: {
      id: true,
      category: { select: { id: true, name: true } },
      start: true
    },
    where: { videoID: parseInt(id) },
    orderBy: { start: 'asc' }
  })

  const star = await prisma.star.findFirst({
    where: { videos: { some: { id: parseInt(id) } } },
    select: { id: true, name: true, image: true, birthdate: true }
  })

  let starVal: VideoStar | null = null
  if (star !== null) {
    const videos = await prisma.video.findMany({
      where: { starID: star.id }
    })

    const { birthdate, ...rest } = star
    starVal = {
      ...rest,
      ageInVideo: dateDiff(videos.find(v => v.id === parseInt(id))?.date, birthdate),
      numVideos: videos.length
    }
  }

  const video = await prisma.video.findFirstOrThrow({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      cover: true,
      api: true,
      path: true,
      added: true,
      date: true,
      duration: true,
      height: true,
      plays: true,
      website: true,
      locations: { select: { location: true } },
      attributes: { select: { attribute: true } },
      site: true,
      apiDate: true,
      validated: true
    }
  })

  if (video.api !== null) {
    // check if date has been validated
    if (!(video.apiDate !== null && formatDate(video.date, true) === video.apiDate)) {
      try {
        video.apiDate = (await getSceneData(video.api)).date.trim()

        // ony update database with new apiDate if nessesary
        await prisma.video.update({
          where: { id: video.id },
          data: { apiDate: video.apiDate }
        })
      } catch (error) {
        console.error(error)
      }
    }
  }

  const { cover, api, path, added, site, apiDate, ...rest } = video
  return {
    props: {
      attributes,
      categories,
      locations,
      video: {
        ...rest,
        image: cover,
        slug: api,
        path: {
          file: path,
          stream: `${path.split('.').slice(0, -1).join('.')}/master.m3u8`
        },
        date: {
          added: formatDate(added),
          published: formatDate(rest.date),
          apiDate: apiDate !== null ? formatDate(apiDate) : null
        },
        plays: rest.plays.length,
        website: rest.website.name,
        star: generateStarName(path),
        locations: rest.locations.map(({ location }) => location),
        attributes: rest.attributes.map(({ attribute }) => attribute),
        subsite: site?.name ?? ''
      },
      star: starVal,
      bookmarks
    }
  }
}

const VideoPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  attributes,
  categories,
  locations,
  video: videoData,
  star: starData,
  bookmarks: bookmarksData
}) => {
  const [video, setVideo] = useState<typeof videoData>() //FIXME videoData cannot be used directly
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
  bookmarks: VideoBookmark[]
  star?: VideoStar | null
  update: {
    video: SetState<Video | undefined>
    star: SetState<VideoStar | null>
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
    <Grid item xs={10} component='section'>
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
  update: SetState<VideoStar | null>
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
        <IconWithText component={MenuItem} icon='delete' text='Remove' onClick={removeStarHandler} />
      </ContextMenu>
    </div>
  )
}

type StarInputProps = {
  video: Video
  update: SetState<VideoStar | null>
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
