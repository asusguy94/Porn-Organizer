import { NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect } from 'react'

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

import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { Flipper, Flipped } from 'react-flip-toolkit'
import { useCopyToClipboard } from 'usehooks-ts'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import Image, { ImageCard } from '@components/image'
import Link from '@components/link'
import ModalComponent, { type ModalHandler, useModal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Dropbox from '@components/dropbox'
import Icon from '@components/icon'

import { daysToYears } from '@utils/client/date-time'
import { getUnique } from '@utils/shared'

import { starService } from '@service'
import { SetState, Similar, StarVideo } from '@interfaces'
import { serverConfig } from '@config'

import styles from './star.module.scss'
import Spinner from '@components/spinner'

type Star = {
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
  similar: Similar[]
}

type StarData = Partial<{
  breast: string[]
  ethnicity: string[]
  haircolor: string[]
}>

const StarPage: NextPage = () => {
  const { query, isReady } = useRouter()

  const { breast, haircolor, ethnicity } = starService.useStarInfo().data ?? {}

  const starID = isReady && typeof query.id === 'string' ? parseInt(query.id) : undefined
  const { data: starData } = starService.useStar<Star>(starID)
  const { data: videos } = starService.useStarVideos(starID)

  const [star, setStar] = useState<Star>()

  const { modal, setModal } = useModal()

  useEffect(() => {
    if (starData !== undefined) {
      setStar(starData)
    }
  }, [starData])

  if (star === undefined) return <Spinner />

  return (
    <Grid container>
      <Grid item xs={7}>
        <div id={styles.star} style={{ maxWidth: '32%' }}>
          <StarImageDropbox star={star} update={setStar} onModal={setModal} />

          <StarTitle star={star} update={setStar} onModal={setModal} />

          <StarForm starData={{ breast, ethnicity, haircolor }} star={star} update={setStar} />
        </div>

        <Grid item xs={12}>
          {<StarVideos videos={videos} />}
        </Grid>
      </Grid>

      <Grid item xs={5}>
        <Sidebar similar={star.similar} />
      </Grid>

      <ModalComponent title={modal.title} visible={modal.visible} filter={modal.filter} onClose={setModal}>
        {modal.data}
      </ModalComponent>
    </Grid>
  )
}

type StarTitleProps = {
  star: Star
  update: SetState<Star | undefined>
  onModal: ModalHandler
}
const StarTitle = ({ star, update, onModal }: StarTitleProps) => {
  const router = useRouter()

  const [, setClipboard] = useCopyToClipboard()

  const copy = async () => await setClipboard(star.name)

  const renameStar = (value: string) => {
    starService.renameStar(star.id, value).then(() => {
      update({ ...star, name: value })
    })
  }

  const setSlug = (value: string) => {
    starService.setSlug(star.id, value).then(() => {
      router.reload()
    })
  }

  const ignoreStar = () => {
    starService.ignoreStar(star).then(({ data }) => {
      update({ ...star, ignored: data.autoTaggerIgnore })
    })
  }

  return (
    <div>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title'>
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
              'Set Slug',
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

        <hr />

        <MenuItem onClick={() => void copy()}>
          <Icon code='copy' /> Copy Star
        </MenuItem>
      </ContextMenu>
    </div>
  )
}

type SidebarProps = {
  similar: Similar[]
}

const Sidebar = ({ similar }: SidebarProps) => (
  <Card>
    <Typography variant='h5' className='text-center'>
      Similar Stars
    </Typography>

    <CardContent>
      <Grid id={styles.similar}>
        {similar.map((similarStar, idx) => (
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
                priority={idx === 0}
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

type StarImageDropboxProps = {
  star: Star
  update: SetState<Star | undefined>
  onModal: ModalHandler
}
const StarImageDropbox = ({ star, update, onModal }: StarImageDropboxProps) => {
  const router = useRouter()

  const removeStar = () => {
    starService.remove(star.id).then(() => {
      router.replace('/star')
    })
  }

  const removeImage = () => {
    starService.removeImage(star.id).then(() => {
      update({ ...star, image: null })
    })
  }

  const addImage = (url: string) => {
    starService.addImage(star.id, url).then(({ data }) => {
      update({ ...star, image: data.image })
    })
  }

  const changeImage = () => {
    const GAP = 4
    const MAX_ROWS = 4
    const MAX_COLS = 8

    const calcCols = (images: string[]) => Math.min(Math.ceil(images.length / Math.floor(MAX_ROWS)), MAX_COLS)
    const calcRows = (images: string[]) => Math.min(images.length, MAX_ROWS)

    starService.getImages(star.id).then(({ data }) => {
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
              <LazyLoadImage src={image} delayMethod='debounce' delayTime={100} className={styles.profile} alt='' />
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

type StarFormProps = {
  star: Star
  starData: StarData
  update: SetState<Star | undefined>
}
const StarForm = ({ star, starData, update }: StarFormProps) => {
  const router = useRouter()

  const updateInfo = (value: string, label: string) => {
    starService.updateInfo(star.id, label, value).then(({ data }) => {
      if (data.reload) {
        router.reload()
      } else {
        if (typeof data.content === 'string') value = data.content

        update({ ...star, info: { ...star.info, [label]: value }, similar: data.similar })
      }
    })
  }

  const resetData = () => {
    starService.resetInfo(star.id).then(() => {
      router.reload()
    })
  }

  const getData = () => {
    starService.getData(star.id).then(() => {
      router.reload()
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
      <StarInputForm update={updateInfo} name='Birthdate' value={star.info.birthdate} noDropdown />
      <StarInputForm update={updateInfo} name='Height' value={star.info.height.toString()} noDropdown />
      <StarInputForm update={updateInfo} name='Weight' value={star.info.weight.toString()} noDropdown />
    </>
  )
}

type StarVideosProps = {
  videos?: StarVideo[]
}
const StarVideos = ({ videos }: StarVideosProps) => {
  const [websites, setWebsites] = useState<string[]>([])
  const [websiteFocus, setWebsiteFocus] = useState<string[]>([])

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

  useEffect(() => {
    if (videos !== undefined) {
      setWebsiteFocus([])
      setWebsites(getUnique(videos.map(v => v.website)))
    }
  }, [videos])

  if (videos === undefined) return <Spinner />

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

      <Flipper flipKey={videos.map(v => v.id)}>
        <Grid container style={{ marginTop: 8 }}>
          {videos
            .map(video => ({ ...video, hidden: websiteFocus.length > 0 && !websiteFocus.includes(video.website) }))
            .sort((a, b) => a.age - b.age)
            .sort((a, b) => Number(a.hidden) - Number(b.hidden))
            .map((v, idx) => (
              <Flipped key={v.id} flipId={v.id}>
                <Link
                  className={`${styles.video} ${v.hidden ? styles.hidden : ''}`}
                  href={{ pathname: '/video/[id]', query: { id: v.id } }}
                >
                  <StarVideo
                    video={v}
                    isFirst={videos.length > 1 && idx === 0}
                    isLast={videos.length > 1 && idx === videos.length - 1}
                    isHidden={v.hidden}
                  />
                </Link>
              </Flipped>
            ))}
        </Grid>
      </Flipper>
    </div>
  )
}

type StarInputFormProps = {
  update: (value: string, label: string) => void
  value: string
  name: string
  list?: string[]
  capitalize?: boolean
  children?: React.ReactNode
  noDropdown?: boolean
}
const StarInputForm = ({
  update,
  value,
  name,
  list,
  children,
  capitalize = false,
  noDropdown = false
}: StarInputFormProps) => {
  const hasDropdown = !noDropdown

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

  const isChanged = inputValue.toLowerCase() !== value.toLowerCase()
  const shouldShrink = isChanged || value.length > 0

  useEffect(() => {
    if (value) {
      setInputValue(value)
    }

    return () => setInputValue('')
  }, [value])

  if (hasDropdown && list === undefined) return <Spinner />

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
          options={list ?? []}
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

type StarVideoProps = {
  video: StarVideo
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
