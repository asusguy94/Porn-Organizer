import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useRouter } from 'next/router'
import { useState, useRef, useEffect, Fragment } from 'react'

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
import ModalComponent, { ModalHandler, useModal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Dropbox from '@components/dropbox'
import { IconWithText } from '@components/icon'
import Spinner from '@components/spinner'

import { daysToYears } from '@utils/client/date-time'
import { formatDate, getUnique } from '@utils/shared'
import prisma from '@utils/server/prisma'
import { dateDiff, getSimilarStars } from '@utils/server/helper'

import { starService } from '@service'
import { SetState, Similar, StarVideo } from '@interfaces'
import { serverConfig } from '@config'

import styles from './star.module.scss'

type Star = {
  id: number
  name: string
  image: string | null
  slug: string | null
  ignored: boolean
  info: {
    breast: string
    haircolor: string[]
    ethnicity: string
    birthdate: string
    height: string
    weight: string
  }
  similar: Similar[]
}

type StarData = Partial<{
  breast: string[]
  ethnicity: string[]
  haircolor: string[]
}>

export const getServerSideProps: GetServerSideProps<
  {
    breast: string[]
    haircolor: string[]
    ethnicity: string[]
    websites: string[]
    star: Star
    videos: StarVideo[]
  },
  { id: string }
> = async context => {
  const id = context.params?.id
  if (id === undefined) throw new Error("'id' is missing")

  const breasts = await prisma.star.findMany({ where: { breast: { not: null } }, orderBy: { breast: 'asc' } })
  const haircolors = await prisma.haircolor.findMany({ orderBy: { name: 'asc' } })
  const ethnicities = await prisma.star.findMany({ where: { ethnicity: { not: null } }, orderBy: { ethnicity: 'asc' } })
  const websites = await prisma.website.findMany({ orderBy: { name: 'asc' } })

  const videos = await prisma.video.findMany({
    where: { starID: parseInt(id) },
    select: {
      id: true,
      name: true,
      date: true,
      path: true,
      starAge: true,
      cover: true,
      star: { select: { birthdate: true } },
      website: { select: { name: true } },
      site: { select: { name: true } }
    },
    orderBy: { date: 'asc' }
  })

  const { haircolors: starHaircolors, ...star } = await prisma.star.findFirstOrThrow({
    where: { id: parseInt(id) },
    select: {
      id: true,
      name: true,
      image: true,
      autoTaggerIgnore: true,
      breast: true,
      haircolors: true,
      ethnicity: true,
      birthdate: true,
      height: true,
      weight: true,
      api: true
    }
  })

  const { autoTaggerIgnore, breast, ethnicity, birthdate, height, weight, api, ...rest } = star
  return {
    props: {
      breast: getUnique(breasts.flatMap(({ breast }) => (breast !== null ? [breast] : []))),
      haircolor: haircolors.map(haircolor => haircolor.name),
      ethnicity: getUnique(ethnicities.flatMap(({ ethnicity }) => (ethnicity !== null ? [ethnicity] : []))),
      websites: websites.map(website => website.name),
      star: {
        ...rest,
        slug: api,
        ignored: autoTaggerIgnore,
        info: {
          breast: breast ?? '',
          haircolor: starHaircolors.map(({ hair: haircolor }) => haircolor),
          ethnicity: ethnicity ?? '',
          // items without autocomplete
          birthdate: birthdate ? formatDate(birthdate, true) : '',
          height: height?.toString() ?? '',
          weight: weight?.toString() ?? ''
        },
        similar: await getSimilarStars(star.id)
      },
      videos: videos
        .map(({ path, website, site, starAge, star, cover, ...video }) => ({
          ...video,
          date: formatDate(video.date),
          fname: path,
          website: website.name,
          site: site?.name ?? null,
          age: starAge ?? dateDiff(star?.birthdate, video.date),
          image: cover ?? '',
          hidden: false
        }))
        .sort((a, b) => a.age - b.age)
    }
  }
}

const StarPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  breast,
  haircolor,
  ethnicity,
  videos,
  star: starData
}) => {
  const [star, setStar] = useState<typeof starData>() //FIXME starData cannot be used directly
  const { modal, setModal } = useModal()

  useEffect(() => {
    setStar(starData)
  }, [starData])

  if (star === undefined) return <Spinner />

  return (
    <Grid container>
      <Grid item xs={7}>
        <div id={styles.star}>
          <StarImageDropbox star={star} update={setStar} onModal={setModal} />

          <StarTitle star={star} update={setStar} onModal={setModal} />

          <StarForm starData={{ breast, ethnicity, haircolor }} star={star} update={setStar} onModal={setModal} />
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
        <IconWithText
          component={MenuItem}
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
          component={MenuItem}
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
          component={MenuItem}
          icon={star.ignored ? 'toggle-yes' : 'toggle-no'}
          text={star.ignored ? 'Enable Star' : 'Ignore Star'}
          onClick={ignoreStar}
        />

        <hr />

        <IconWithText component={MenuItem} icon='copy' text='Copy Star' onClick={() => void copy()} />
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
        {similar.map((star, idx) => (
          <Link key={star.id} href={{ pathname: '/star/[id]', query: { id: star.id } }} className={styles.star}>
            <RibbonContainer component={Card}>
              <ImageCard
                src={`${serverConfig.api}/star/${star.id}/image`}
                width={200}
                height={275}
                missing={star.image === null}
                scale={5}
                alt='star'
                priority={idx === 0}
              />

              <Typography>{star.name}</Typography>

              <Ribbon label={`${star.match}%`} />
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
            <IconWithText component={MenuItem} icon='delete' text='Delete Image' onClick={removeImage} />
          </ContextMenu>
        </>
      ) : (
        <>
          <ContextMenuTrigger id='star__dropbox'>
            <Dropbox onDrop={addImage} />
          </ContextMenuTrigger>

          <ContextMenu id='star__dropbox'>
            <IconWithText component={MenuItem} icon='delete' text='Remove Star' onClick={removeStar} />
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
  onModal: ModalHandler
}
const StarForm = ({ star, starData, update, onModal }: StarFormProps) => {
  const router = useRouter()

  const [hasMissing, setMissing] = useState(false) //FIXME disabled for now, as the required api is not working

  const addHaircolor = (name: string) => {
    starService.addHaircolor(star.id, name).then(() => {
      update({ ...star, info: { ...star.info, haircolor: [...star.info.haircolor, name] } })
    })
  }

  const removeHaircolor = (name: string) => {
    starService.removeHaircolor(star.id, name).then(() => {
      update({
        ...star,
        info: {
          ...star.info,
          haircolor: star.info.haircolor.filter(haircolor => haircolor.toLowerCase() !== name.toLowerCase())
        }
      })
    })
  }

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

      <StarInputForm
        update={addHaircolor}
        name='Haircolor'
        emptyByDefault
        value={star.info.haircolor}
        list={starData.haircolor}
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

type InputFormDataProps = {
  data: string[]
  remove: (name: string) => void
  label: string
}
const InputFormData = ({ label, data, remove }: InputFormDataProps) => {
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
            <IconWithText component={MenuItem} icon='delete' text='Remove' onClick={() => remove(item)} />
          </ContextMenu>
        </Fragment>
      ))}
    </>
  )
}

type StarVideosProps = {
  videos?: StarVideo[]
}
const StarVideos = ({ videos }: StarVideosProps) => {
  const [websites, setWebsites] = useState<string[]>([])
  const [sites, setSites] = useState<string[]>([])

  const [focus, setFocus] = useState<string[]>([])

  const toggleFocus = (websiteOrSite: string) => {
    // allow multiple items to be selected
    if (focus.includes(websiteOrSite)) {
      // remove item from focus
      setFocus(focus.filter(item => item !== websiteOrSite))
    } else {
      // add item to focus
      setFocus(prev => [...prev, websiteOrSite])
    }
  }

  useEffect(() => {
    if (videos !== undefined) {
      setFocus([])

      setWebsites(getUnique(videos.map(video => video.website)))
      setSites(getUnique(videos.flatMap(video => (video.site !== null ? [video.site] : []))))
    }
  }, [videos])

  if (videos === undefined) return <Spinner />

  return (
    <div>
      <Typography variant='h6'>
        Videos
        {websites.length > 1
          ? websites.map(website => (
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
            ))
          : sites.length > 1
          ? sites.map(site => (
              <Button
                key={site}
                size='small'
                variant={focus.includes(site) ? 'contained' : 'outlined'}
                color='primary'
                style={{ marginLeft: 8 }}
                onClick={() => toggleFocus(site)}
              >
                {site}
              </Button>
            ))
          : null}
      </Typography>

      <Flipper flipKey={videos.map(video => video.id)}>
        <Grid container style={{ marginTop: 8 }}>
          {videos
            .map(video => {
              if (focus.length > 0) {
                if (websites.length > 1) {
                  return { ...video, hidden: !focus.includes(video.website) }
                } else if (sites.length > 1 && video.site !== null) {
                  return { ...video, hidden: !focus.includes(video.site) }
                }
              }

              return { ...video, hidden: false }
            })
            .sort((a, b) => a.age - b.age)
            .sort((a, b) => Number(a.hidden) - Number(b.hidden))
            .map((video, idx) => (
              <Flipped key={video.id} flipId={video.id}>
                <Link
                  className={`${styles.video} ${video.hidden ? styles.hidden : ''}`}
                  href={{ pathname: '/video/[id]', query: { id: video.id } }}
                >
                  <StarVideo
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
const StarInputForm = ({
  update,
  value,
  name,
  list,
  children,
  capitalize = false,
  noDropdown = false,
  emptyByDefault = false
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
      <Grid item xs={3}>
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
