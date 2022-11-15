import { NextPage } from 'next/types'
import { useRouter } from 'next/router'
import React, { useState, useRef, useEffect } from 'react'

import {
  Button,
  TextField,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia as MUICardMedia,
  Typography,
  Autocomplete,
  ImageList,
  ImageListItem
} from '@mui/material'

import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { Flipper, Flipped } from 'react-flip-toolkit'
import { useCopyToClipboard } from 'usehooks-ts'
import useSWR from 'swr'

import Image, { ImageCard } from '@components/image'
import Link from '@components/link'
import Modal, { type IModalHandler, useModal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Dropbox from '@components/dropbox'
import Icon from '@components/icon'

import { daysToYears } from '@utils/client/date-time'
import fetcher from '@utils/client/fetcher'

import { starApi } from '@api'
import { ISetState, ISimilar, IStarVideo } from '@interfaces'
import { serverConfig } from '@config'

import styles from './star.module.scss'

interface IStar {
  id: number
  name: string
  image: string | null
  ignored: boolean
  info: {
    breast: string
    haircolor: string
    ethnicity: string
    birthdate: string
    height: number
    weight: number
  }
  similar: ISimilar[]
}

interface IStarData {
  breast: string[]
  ethnicity: string[]
  haircolor: string[]
}

const StarPage: NextPage = () => {
  const { query } = useRouter()

  const { modal, setModal } = useModal()

  const [star, setStar] = useState<IStar>()

  const { data: starData } = useSWR<{
    breast: string[]
    haircolor: string[]
    ethnicity: string[]
  }>(`${serverConfig.api}/star`, fetcher)

  const [videos, setVideos] = useState<IStarVideo[]>([])

  useEffect(() => {
    if (typeof query.id === 'string') {
      const starID = parseInt(query.id)

      starApi.get<IStar>(starID).then(({ data }) => setStar(data))
      starApi.getVideos(starID).then(({ data }) => setVideos(data))
    }
  }, [query.id])

  if (star === undefined) return null

  return (
    <Grid container>
      <Grid item xs={8}>
        <Grid item xs={8}>
          <Grid item xs={3} id={styles.star}>
            <StarImageDropbox star={star} update={setStar} onModal={setModal} />

            <StarTitle star={star} update={setStar} onModal={setModal} />

            <StarForm
              starData={starData ?? { breast: [], ethnicity: [], haircolor: [] }}
              star={star}
              update={setStar}
            />
          </Grid>

          {videos.length > 0 && <StarVideos videos={videos} update={setVideos} />}
        </Grid>
      </Grid>

      <Grid item xs={4}>
        <Sidebar similar={star.similar} />
      </Grid>

      <Modal title={modal.title} visible={modal.visible} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </Modal>
    </Grid>
  )
}

interface StarTitleProps {
  star: IStar
  update: ISetState<IStar | undefined>
  onModal: IModalHandler
}
const StarTitle = ({ star, update, onModal }: StarTitleProps) => {
  const [, setClipboard] = useCopyToClipboard()

  const copy = async () => await setClipboard(star.name)

  const renameStar = (value: string) => {
    starApi.renameStar(star.id, value).then(() => {
      update({ ...star, name: value })
    })
  }

  const setSlug = (value: string) => {
    starApi.setSlug(star.id, value).then(() => {
      window.location.reload()
    })
  }

  const ignoreStar = () => {
    starApi.ignoreStar(star).then(({ data }) => {
      update({ ...star, ignored: data.autoTaggerIgnore })
    })
  }

  return (
    <div>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title' holdToDisplay={-1}>
          <h2 id={star.ignored ? styles.ignored : ''}>{star.name}</h2>
        </ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <MenuItem
          onClick={() => {
            onModal(
              'Rename',
              <TextField
                variant='outlined'
                label='Star'
                defaultValue={star.name}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    onModal()

                    renameStar((e.target as HTMLInputElement).value)
                  }
                }}
              />
            )
          }}
        >
          <Icon code='edit' /> Rename
        </MenuItem>

        <MenuItem
          onClick={() => {
            onModal(
              'Rename',
              <TextField
                variant='outlined'
                label='Slug'
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    onModal()

                    setSlug((e.target as HTMLInputElement).value)
                  }
                }}
              />
            )
          }}
        >
          <Icon code='edit' /> Set Slug
        </MenuItem>

        <MenuItem onClick={ignoreStar}>
          {star.ignored ? (
            <>
              <Icon code='toggle-yes' /> Enable Star
            </>
          ) : (
            <>
              <Icon code='toggle-no' /> Ignore Star
            </>
          )}
        </MenuItem>

        <MenuItem divider />

        <MenuItem onClick={() => void copy()}>
          <Icon code='copy' /> Copy Star
        </MenuItem>
      </ContextMenu>
    </div>
  )
}

interface SidebarProps {
  similar: ISimilar[]
}

const Sidebar = ({ similar }: SidebarProps) => (
  <Card>
    <Typography variant='h5' className='text-center'>
      Similar Stars
    </Typography>

    <CardContent>
      <Grid id={styles.similar}>
        {similar.map((similarStar, i) => (
          <Link
            key={similarStar.id}
            href={{ pathname: '/star/[id]', query: { id: similarStar.id } }}
            className={styles.star}
          >
            <RibbonContainer component={Card}>
              <ImageCard
                src={`${serverConfig.api}/star/${similarStar.id}/image`}
                width={200}
                height={275}
                missing={similarStar.image === null}
                scale={5}
                alt='star'
                priority={i === 0}
              />

              <Typography>{similarStar.name}</Typography>

              <Ribbon label={`${similarStar.match}%`} />
            </RibbonContainer>
          </Link>
        ))}
      </Grid>
    </CardContent>
  </Card>
)

interface StarImageDropboxProps {
  star: IStar
  update: ISetState<IStar | undefined>
  onModal: IModalHandler
}
const StarImageDropbox = ({ star, update, onModal }: StarImageDropboxProps) => {
  const removeStar = () => {
    starApi.remove(star.id).then(() => {
      window.location.href = '/star'
    })
  }

  const removeImage = () => {
    starApi.removeImage(star.id).then(() => {
      update({ ...star, image: null })
    })
  }

  const addImage = (url: string) => {
    starApi.addImage(star.id, url).then(({ data }) => {
      update({ ...star, image: data.image })
    })
  }

  const changeImage = () => {
    const GAP = 4
    const MAX_ROWS = 4
    const MAX_COLS = 8

    const calcCols = (images: string[]) => Math.min(Math.ceil(images.length / MAX_ROWS), MAX_COLS)
    const calcRows = (images: string[]) => Math.min(images.length, MAX_ROWS)

    starApi.getImages(star.id).then(({ data }) => {
      onModal(
        'Change Image',
        <ImageList cols={calcCols(data.images)} sx={{ margin: 0, height: (275 + GAP) * calcRows(data.images) }}>
          {data.images.map(image => (
            <ImageListItem
              key={image}
              onClick={() => {
                addImage(image)

                onModal()
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} className={styles.profile} alt='' />
            </ImageListItem>
          ))}
        </ImageList>
      )
    })
  }

  return (
    <div className='d-inline-block' onDoubleClick={changeImage}>
      {star.image !== null ? (
        <>
          <ContextMenuTrigger id='star__image'>
            <Image
              id={styles.profile}
              src={`${serverConfig.api}/star/${star.id}/image`}
              width={200}
              height={275}
              alt='star'
              priority
            />
          </ContextMenuTrigger>

          <ContextMenu id='star__image'>
            <MenuItem onClick={removeImage}>
              <Icon code='trash' /> Delete Image
            </MenuItem>
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={addImage} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <MenuItem onClick={removeStar}>
              <Icon code='trash' /> Remove Star
            </MenuItem>
          </ContextMenu>
        </>
      )}
    </div>
  )
}

interface StarFormProps {
  star: IStar
  starData: IStarData
  update: ISetState<IStar | undefined>
}
const StarForm = ({ star, starData, update }: StarFormProps) => {
  const updateInfo = (value: string, label: string) => {
    starApi.updateInfo(star.id, label, value).then(({ data }) => {
      if (data.reload) {
        window.location.reload()
      } else {
        if (data.content !== null) value = data.content

        update({ ...star, info: { ...star.info, [label]: value }, similar: data.similar })
      }
    })
  }

  const resetData = () => {
    starApi.resetInfo(star.id).then(() => {
      window.location.reload()
    })
  }

  const getData = () => {
    starApi.getData(star.id).then(({ data }) => {
      if (typeof data !== 'string') {
        window.location.reload()
      }
    })
  }

  return (
    <>
      <div>
        <Button variant='contained' color='primary' className={styles.action} onClick={getData} disabled={star.ignored}>
          Get Data
        </Button>

        <Button variant='contained' color='error' className={styles.action} onClick={resetData}>
          Reset Data
        </Button>
      </div>

      <StarInputForm update={updateInfo} name='Breast' value={star.info.breast} list={starData.breast} capitalize />
      <StarInputForm update={updateInfo} name='HairColor' value={star.info.haircolor} list={starData.haircolor} />
      <StarInputForm update={updateInfo} name='Ethnicity' value={star.info.ethnicity} list={starData.ethnicity} />
      <StarInputForm update={updateInfo} name='Birthdate' value={star.info.birthdate} />
      <StarInputForm update={updateInfo} name='Height' value={star.info.height.toString()} />
      <StarInputForm update={updateInfo} name='Weight' value={star.info.weight.toString()} />
    </>
  )
}

interface StarVideosProps {
  videos: IStarVideo[]
  update: ISetState<IStarVideo[]>
}
const StarVideos = ({ videos, update }: StarVideosProps) => {
  const [websites, setWebsites] = useState<string[]>([])
  const [websiteFocus, setWebsiteFocus] = useState<string[]>([])

  useEffect(() => {
    update([...videos].sort((a, b) => a.age - b.age).sort((a, b) => Number(a.hidden) - Number(b.hidden)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [websiteFocus])

  const toggleWebsiteFocus = (website: string) => {
    // allow multiple websites to be selected
    if (websiteFocus.includes(website)) {
      // remove website from websiteFocus
      setWebsiteFocus(websiteFocus.filter(websiteItem => websiteItem !== website))
    } else {
      // add website to websiteFocus
      setWebsiteFocus([...websiteFocus, website])
    }
  }

  return (
    <div>
      <Typography variant='h6'>
        Videos
        {websites.length > 1 &&
          websites.map(website => (
            <Button
              key={website}
              size='small'
              variant={websiteFocus.includes(website) ? 'contained' : 'outlined'}
              color='primary'
              style={{ marginLeft: 8 }}
              onClick={() => toggleWebsiteFocus(website)}
            >
              {website}
            </Button>
          ))}
      </Typography>

      <Flipper flipKey={videos}>
        <Grid container style={{ marginTop: 8 }}>
          {videos.map((video, i) => {
            if (!websites.includes(video.website)) {
              setWebsites([...websites, video.website])
            }

            video.hidden = websiteFocus.length > 0 && !websiteFocus.includes(video.website)

            return (
              <Flipped key={video.id} flipId={video.id}>
                <Link
                  className={`${styles.video} ${video.hidden ? styles.hidden : ''}`}
                  href={{ pathname: '/video/[id]', query: { id: video.id } }}
                >
                  <StarVideo
                    video={video}
                    isFirst={videos.length > 1 && i === 0}
                    isLast={videos.length > 1 && i === videos.length - 1}
                    isHidden={video.hidden}
                  />
                </Link>
              </Flipped>
            )
          })}
        </Grid>
      </Flipper>
    </div>
  )
}

// ContainerItem
interface StarInputFormProps {
  update: (value: string, label: string) => void
  value: string
  name: string
  list?: string[]
  capitalize?: boolean
  children?: React.ReactNode
}
const StarInputForm = ({ update, value, name, list = [], children, capitalize = false }: StarInputFormProps) => {
  const hasDropdown = list.length > 0

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const updateValue = (value: string) => {
    if (value === '') setOpen(false)

    setInputValue(value)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (!open && e.key === 'Enter') {
      update(inputValue, name.toLowerCase())
    }
  }

  const isChanged = inputValue.toLowerCase() !== (value || '').toLowerCase()
  const shouldShrink = isChanged || (typeof value === 'string' && value.length > 0)

  useEffect(() => {
    if (value) {
      setInputValue(value)
    }
  }, [value])

  return (
    <Grid container style={{ marginBottom: 4 }}>
      <Grid item xs={10}>
        <Autocomplete
          inputValue={inputValue}
          //
          // EVENTS
          onInputChange={(e, val, reason) => {
            if (reason === 'reset' && !open) return

            updateValue(val)
          }}
          onKeyPress={handleKeyPress}
          //
          // OPTIONS
          options={list}
          renderInput={params => (
            <TextField
              {...params}
              variant='standard'
              label={name}
              color='primary'
              InputLabelProps={{ shrink: shouldShrink, className: styles['no-error'] }}
              className={`${capitalize ? styles.capitalize : ''} ${isChanged ? styles.error : ''}`}
            />
          )}
          autoHighlight
          clearOnBlur={false}
          //
          // open/closed STATUS
          open={open}
          onOpen={() => setOpen(hasDropdown)}
          onClose={() => setOpen(false)}
          //
          // SIMULATE input instead of dropdown
          forcePopupIcon={hasDropdown}
        />
      </Grid>

      <Grid item style={{ marginTop: 18, marginLeft: 2 }}>
        {children}
      </Grid>
    </Grid>
  )
}

interface StarVideoProps {
  video: IStarVideo
  isFirst: boolean
  isLast: boolean
  isHidden: boolean
}
const StarVideo = ({ video, isFirst, isLast, isHidden }: StarVideoProps) => {
  const [src, setSrc] = useState('')
  const [dataSrc, setDataSrc] = useState(`${serverConfig.api}/video/${video.id}/file`)

  const thumbnail = useRef<NodeJS.Timer>()

  // eslint-disable-next-line @typescript-eslint/require-await
  const reload = async () => {
    setSrc(dataSrc)
    setDataSrc('')
  }

  const unload = () => {
    setDataSrc(src)
    setSrc('')
  }

  const playFrom = (video: HTMLVideoElement, time = 0) => {
    if (time) video.currentTime = time

    video.play()
  }

  const stopFrom = (video: HTMLVideoElement, time = 0) => {
    if (time) video.currentTime = time

    video.pause()
  }

  const startThumbnailPlayback = (video: HTMLVideoElement) => {
    let time = 100
    const offset = 60
    const duration = 1.5

    playFrom(video)
    thumbnail.current = setInterval(() => {
      time += offset
      if (time > video.duration) {
        stopThumbnailPlayback(video).then(() => startThumbnailPlayback(video))
      }
      playFrom(video, (time += offset))
    }, duration * 1000)
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  const stopThumbnailPlayback = async (video: HTMLVideoElement) => {
    stopFrom(video)

    clearInterval(thumbnail.current)
  }

  const handleMouseEnter = ({ target }: React.MouseEvent<HTMLVideoElement> & { target: HTMLVideoElement }) => {
    if (!isHidden) {
      if (dataSrc.length && !src.length) {
        reload().then(() => startThumbnailPlayback(target))
      }
    }
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
    if (!dataSrc.length && src.length) {
      stopThumbnailPlayback(e.currentTarget).then(() => unload())
    }
  }

  return (
    <RibbonContainer component={Card}>
      <CardActionArea>
        <MUICardMedia
          component='video'
          src={src}
          data-src={dataSrc}
          poster={`${serverConfig.api}/video/${video.id}/thumb`}
          preload='metadata'
          muted
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        />

        <CardContent className={styles.info}>
          <Typography className='text-center'>{video.name}</Typography>
          <Typography className={styles['site-info']}>
            <span className={styles.wsite}>{video.website}</span>

            {video.site !== null && (
              <>
                <span className='divider'>/</span>
                <span className={styles.site}>{video.site}</span>
              </>
            )}
          </Typography>

          <Ribbon isFirst={isFirst} isLast={isLast} align='left' />

          {video.age > 0 && <Ribbon label={daysToYears(video.age)} />}
        </CardContent>
      </CardActionArea>
    </RibbonContainer>
  )
}

export default StarPage
