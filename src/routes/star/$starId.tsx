import React, { useState, useRef, useEffect, Fragment } from 'react'

import {
  Button,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  TextField,
  ImageListItem,
  ImageList,
  FormControlLabel,
  Checkbox,
  Autocomplete
} from '@mui/material'

import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import dayjs from 'dayjs'
import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'
import { Flipper, Flipped } from 'react-flip-toolkit'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useCopyToClipboard } from 'usehooks-ts'

import Dropbox from '@/components/dropbox'
import { IconWithText } from '@/components/icon'
import MissingImage from '@/components/image/missing'
import ModalComponent, { ModalHandler, useModal } from '@/components/modal'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import Spinner from '@/components/spinner'

import { serverConfig } from '@/config'
import { Similar, Star, StarVideo } from '@/interface'
import { starService } from '@/service'
import { daysToYears, getUnique, retiredUtil } from '@/utils'

import styles from './star.module.scss'

export const Route = createFileRoute('/star/$starId')({
  parseParams: ({ starId }) => ({ starId: parseInt(starId) }),
  component: StarPage
})

function StarPage() {
  const { starId } = Route.useParams()

  const { data: star } = starService.useStar(starId)
  const { data: videos } = starService.useVideos(starId)
  const { modal, setModal } = useModal()

  if (star === undefined) return <Spinner />

  return (
    <Grid container style={{ marginTop: 12 }}>
      <Grid item xs={7}>
        <div id={styles.star}>
          <StarImageDropbox star={star} onModal={setModal} />
          <StarTitle star={star} onModal={setModal} />
          <StarForm star={star} />
          <RetiredStarStatus star={star} videos={videos} />
        </div>

        <Grid item xs={12} marginRight='1em'>
          <Videos videos={videos} />
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
  onModal: ModalHandler
}
function StarTitle({ star, onModal }: StarTitleProps) {
  const [, setClipboard] = useCopyToClipboard()

  const copy = () => {
    setClipboard(star.name)
  }

  const renameStar = (value: string) => {
    starService.renameStar(star.id, value).then(() => {
      location.reload()
    })
  }

  const setSlug = (value: string) => {
    starService.setSlug(star.id, value).then(() => {
      location.reload()
    })
  }

  const ignoreStar = () => {
    starService.ignoreStar(star).then(() => {
      location.reload()
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
        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Rename'
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
        />

        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Set Slug'
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
        />

        <IconWithText
          component={ContextMenuItem}
          icon={star.ignored ? 'toggle-yes' : 'toggle-no'}
          text={star.ignored ? 'Enable Star' : 'Ignore Star'}
          onClick={ignoreStar}
        />

        <hr />

        <IconWithText component={ContextMenuItem} icon='copy' text='Copy Star' onClick={copy} />
      </ContextMenu>
    </div>
  )
}

type SidebarProps = {
  similar: Similar[]
}

function Sidebar({ similar }: SidebarProps) {
  return (
    <Card>
      <Typography variant='h5' className='text-center'>
        Similar Stars
      </Typography>

      <CardContent>
        <Grid id={styles.similar}>
          {similar.map(star => (
            <Link key={star.id} to='/star/$starId' params={{ starId: star.id }} className={styles.star}>
              <RibbonContainer component={Card}>
                <CardMedia style={{ height: 275, textAlign: 'center' }}>
                  {star.image === null ? (
                    <MissingImage renderStyle='height' scale={5} />
                  ) : (
                    <img
                      src={`${serverConfig.newApi}/star/${star.id}/image`}
                      style={{ width: '100%', height: '100%' }}
                      alt='star'
                    />
                  )}
                </CardMedia>

                <Typography>{star.name}</Typography>

                <Ribbon label={`${star.match}%`} />
              </RibbonContainer>
            </Link>
          ))}
        </Grid>
      </CardContent>
    </Card>
  )
}

type StarImageDropboxProps = {
  star: Star
  onModal: ModalHandler
}
function StarImageDropbox({ star, onModal }: StarImageDropboxProps) {
  const navigate = useNavigate()
  const { mutate } = starService.useAddImage(star.id)

  const removeStar = () => {
    starService.remove(star.id).then(() => {
      navigate({ to: '/star', replace: true })
    })
  }

  const removeImage = () => {
    starService.removeImage(star.id).then(() => {
      location.reload()
    })
  }

  const addImage = (url: string) => {
    mutate({ url })
  }

  const changeImage = () => {
    const GAP = 4
    const MAX_ROWS = 4
    const MAX_COLS = 8

    const calcCols = (images: string[]) => Math.min(Math.ceil(images.length / Math.floor(MAX_ROWS)), MAX_COLS)
    const calcRows = (images: string[]) => Math.min(images.length, MAX_ROWS)

    starService.getImages(star.id).then(({ data: { images } }) => {
      onModal(
        'Change Image',
        <ImageList cols={calcCols(images)} sx={{ margin: 0, height: (275 + GAP) * calcRows(images) }}>
          {images.map(image => (
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
            <img id={styles.profile} src={`${serverConfig.newApi}/star/${star.id}/image`} alt='star' />
          </ContextMenuTrigger>

          <ContextMenu id='star__image'>
            <IconWithText component={ContextMenuItem} icon='delete' text='Delete Image' onClick={removeImage} />
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={addImage} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <IconWithText component={ContextMenuItem} icon='delete' text='Remove Star' onClick={removeStar} />
          </ContextMenu>
        </>
      )}
    </div>
  )
}

type StarFormProps = {
  star: Star
}
function StarForm({ star }: StarFormProps) {
  const { data: starData } = starService.useInfo()
  const { mutate } = starService.useAddHaircolor(star.id)

  const addHaircolor = (name: string) => {
    mutate({ name })
  }

  const removeHaircolor = (name: string) => {
    starService.removeHaircolor(star.id, name).then(() => {
      location.reload()
    })
  }

  const updateInfo = (value: string, label: string) => {
    starService.updateInfo(star.id, label, value).then(() => {
      location.reload()
    })
  }

  const resetData = () => {
    starService.resetInfo(star.id).then(() => {
      location.reload()
    })
  }

  const getData = () => {
    starService.getData(star.id).then(() => {
      location.reload()
    })
  }

  if (starData === undefined) return <Spinner />

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

      <StarInputForm
        update={addHaircolor}
        name='Haircolor'
        value={star.info.haircolor}
        list={starData.haircolor}
        emptyByDefault
      >
        <InputFormData label='haircolor' data={star.info.haircolor} remove={removeHaircolor} />
      </StarInputForm>

      <StarInputForm update={updateInfo} name='Ethnicity' value={star.info.ethnicity} list={starData.ethnicity} />
      <StarInputForm update={updateInfo} name='Birthdate' value={star.info.birthdate} noDropdown />
      <StarInputForm update={updateInfo} name='Height' value={star.info.height.toString()} noDropdown />
      <StarInputForm update={updateInfo} name='Weight' value={star.info.weight.toString()} noDropdown />
    </>
  )
}

type RetiredStarStatusProps = {
  star: Star
  videos?: StarVideo[]
}

function RetiredStarStatus({ star, videos }: RetiredStarStatusProps) {
  const [checked, setChecked] = useState(false)
  const { mutate } = starService.useSetRetired(star.id)

  useEffect(() => {
    setChecked(star.retired)
  }, [star])

  if (videos === undefined) return <Spinner />

  const latestVideo = videos
    .map(video => dayjs(video.date))
    .sort((a, b) => b.diff(a))
    .at(0)

  if (latestVideo === undefined) return null

  const { shouldBeRetired } = retiredUtil(latestVideo)

  const toggleStatus = (status: boolean) => {
    mutate({ retired: status })
  }

  if (star.retired === shouldBeRetired) return null

  return (
    <FormControlLabel
      label={shouldBeRetired ? 'Mark as Retired?' : 'Mark as Active?'}
      control={<Checkbox checked={checked} onChange={(_e, status) => toggleStatus(status)} />}
    />
  )
}

type VideosProps = {
  videos?: StarVideo[]
}
function Videos({ videos }: VideosProps) {
  const [websites, setWebsites] = useState<string[]>([])
  const [focus, setFocus] = useState<string[]>([])

  const toggleFocus = (website: string) => {
    // allow multiple items to be selected
    if (focus.includes(website)) {
      // remove item from focus
      setFocus(focus.filter(item => item !== website))
    } else {
      // add item to focus
      setFocus(prev => [...prev, website])
    }
  }

  useEffect(() => {
    if (videos !== undefined) {
      setFocus([])

      setWebsites(getUnique(videos.map(video => video.website)))
    }
  }, [videos])

  if (videos === undefined) return <Spinner />

  return (
    <div>
      <Typography variant='h6'>
        {websites.length > 1 &&
          websites.map(website => (
            <Button
              key={website}
              size='small'
              variant={focus.includes(website) ? 'contained' : 'outlined'}
              color='primary'
              style={{ marginLeft: 8 }}
              onClick={() => toggleFocus(website)}
            >
              {website}
            </Button>
          ))}
      </Typography>

      <Flipper flipKey={videos.map(video => video.id)}>
        <Grid container style={{ marginTop: 8 }}>
          {videos
            .map(video => {
              if (focus.length > 0 && websites.length > 1) {
                return { ...video, hidden: !focus.includes(video.website) }
              }

              return { ...video, hidden: false }
            })
            .sort((a, b) => a.age - b.age)
            .sort((a, b) => Number(a.hidden) - Number(b.hidden))
            .map((video, idx) => (
              <Flipped key={video.id} flipId={video.id}>
                <Link
                  className={`${styles.video} ${video.hidden ? styles.hidden : ''}`}
                  to='/video/$videoId'
                  params={{ videoId: video.id }}
                >
                  <Video
                    video={video}
                    isFirst={videos.length > 1 && idx === 0}
                    isLast={videos.length > 1 && idx === videos.length - 1}
                    isHidden={video.hidden}
                  />
                </Link>
              </Flipped>
            ))}
        </Grid>
      </Flipper>
    </div>
  )
}

type VideoProps = {
  video: StarVideo
  isFirst: boolean
  isLast: boolean
  isHidden: boolean
}
function Video({ video, isFirst, isLast, isHidden }: VideoProps) {
  const [src, setSrc] = useState('')
  const [dataSrc, setDataSrc] = useState(`${serverConfig.newApi}/video/${video.id}/file`)

  const thumbnail = useRef<NodeJS.Timeout>()

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
        <CardMedia
          component='video'
          src={src}
          data-src={dataSrc}
          poster={`${serverConfig.newApi}/video/${video.id}/thumb`}
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

type StarInputFormProps = {
  update: (value: string, label: string) => void
  value: string | string[]
  name: string
  list?: string[]
  capitalize?: boolean
  children?: React.ReactNode
  noDropdown?: boolean
  emptyByDefault?: boolean
}
function StarInputForm({
  update,
  value,
  name,
  list,
  children,
  capitalize = false,
  noDropdown = false,
  emptyByDefault = false
}: StarInputFormProps) {
  const hasDropdown = !noDropdown

  const [open, setOpen] = useState(false)
  const [inputValue, setInputValue] = useState('')

  const updateValue = (value: string) => {
    if (value === '') setOpen(false)

    setInputValue(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!open) {
      update(inputValue, name.toLowerCase())

      if (emptyByDefault) setInputValue('')
    }
  }

  const isChanged =
    inputValue.toLowerCase() !== (typeof value === 'string' && !emptyByDefault ? value : '').toLowerCase()
  const shouldShrink = isChanged || (typeof value === 'string' && value.length > 0)

  useEffect(() => {
    if (!emptyByDefault && typeof value === 'string') {
      setInputValue(value)
    }

    return () => setInputValue('')
  }, [emptyByDefault, value])

  if (hasDropdown && list === undefined) return <Spinner />

  // FIXME excluding an item from dropdown causes a warning
  return (
    <Grid container style={{ marginBottom: 4 }}>
      <Grid item xs={3} component='form' onSubmit={handleSubmit}>
        <Autocomplete
          inputValue={inputValue}
          //
          // EVENTS
          onInputChange={(_e, val, reason) => {
            if (reason === 'reset' && !open) return

            updateValue(val)
          }}
          //
          // OPTIONS
          options={list?.filter(item => !(emptyByDefault && value.includes(item))) ?? []}
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

      <Grid item style={{ marginTop: 14, marginLeft: 8 }}>
        {children}
      </Grid>
    </Grid>
  )
}

type InputFormDataProps = {
  data: string[]
  remove: (name: string) => void
  label: string
}
export function InputFormData({ label, data, remove }: InputFormDataProps) {
  return (
    <>
      {data.map(item => (
        <Fragment key={item}>
          <ContextMenuTrigger id={`${label}-${item}`} className='d-inline-block'>
            <span className={styles.data}>
              <Button size='small' variant='outlined' color='primary'>
                {item}
              </Button>
            </span>
          </ContextMenuTrigger>

          <ContextMenu id={`${label}-${item}`}>
            <IconWithText component={ContextMenuItem} icon='delete' text='Remove' onClick={() => remove(item)} />
          </ContextMenu>
        </Fragment>
      ))}
    </>
  )
}
