import { useRouter } from 'next/router'
import { useState } from 'react'

import { Button, Grid, ImageList, ImageListItem, TextField, Typography } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { useCopyToClipboard } from 'usehooks-ts'
import { LazyLoadImage } from 'react-lazy-load-image-component'

import Icon, { IconWithText } from '../icon'
import { ModalHandler } from '../modal'
import Spinner from '../spinner'

import { attributeService, locationService, videoService } from '@service'
import { General, SetState, Video } from '@interfaces'
import { settingsConfig } from '@config'
import { formatDate } from '@utils/shared'

import styles from './header.module.scss'

type HeaderProps = {
  video: Video
  attributes?: General[]
  locations?: General[]
  update: SetState<Video | undefined>
  onModal: ModalHandler
}
const Header = ({ video, attributes, locations, update, onModal }: HeaderProps) => (
  <Grid container>
    <Grid container item alignItems='center' component='header' id={styles.header}>
      <HeaderTitle video={video} attributes={attributes} locations={locations} update={update} onModal={onModal} />

      <HeaderSlug video={video} hidden={video.slug !== null} onModal={onModal} />
      <HeaderCover video={video} hidden={video.image !== null || video.slug === null} />
      <ValidateTitle video={video} hidden={video.validated || video.slug === null} onModal={onModal} />

      <HeaderDate video={video} />

      <HeaderLocations video={video} update={update} />
      <HeaderAttributes video={video} update={update} />
      <HeaderSite video={video} />
    </Grid>
  </Grid>
)

type HeaderSiteProps = {
  video: Video
}
const HeaderSite = ({ video }: HeaderSiteProps) => (
  <Grid item xs={12} id={styles.site}>
    <span id={styles.wsite}>{video.website}</span>
    {video.subsite && (
      <>
        <span className='divider'>-</span>
        <span id={styles.site}>{video.subsite}</span>
      </>
    )}
  </Grid>
)

type HeaderSlugProps = {
  video: Video
  hidden?: boolean
  onModal: ModalHandler
}
const HeaderSlug = ({ video, hidden = false, onModal }: HeaderSlugProps) => {
  const router = useRouter()

  const viewSlugs = () => {
    const GAP = 4
    const MAX_ROWS = 4
    const MAX_COLS = 8

    const calcCols = (images: unknown[]) => Math.min(Math.ceil(images.length / Math.floor(MAX_ROWS)), MAX_COLS)
    const calcRows = (images: unknown[]) => Math.min(images.length, MAX_ROWS)

    videoService.getSlugs(video.id).then(({ data }) => {
      data.sort((a, b) => {
        const matchesA = [
          a.title === video.name,
          [video.website, video.subsite].includes(a.site),
          a.date === formatDate(video.date.published, true)
        ].filter(Boolean).length

        const matchesB = [
          b.title === video.name,
          [video.website, video.subsite].includes(b.site),
          b.date === formatDate(video.date.published, true)
        ].filter(Boolean).length

        return matchesB - matchesA
      })

      onModal(
        'Select Slug',
        <ImageList cols={calcCols(data)} sx={{ margin: 0, height: (275 + GAP) * calcRows(data) }}>
          {data.map(item => (
            <ImageListItem
              key={item.id}
              onClick={() => {
                setSlug(item.id)
                onModal()
              }}
              style={{ alignItems: 'center' }}
            >
              <pre>{item.title}</pre>
              <LazyLoadImage
                src={item.image}
                delayMethod='debounce'
                delayTime={100}
                className={styles['select-slug']}
                alt=''
              />
              <pre>[{item.site}]</pre>

              {data.length > 1 && <pre>{item.date}</pre>}
            </ImageListItem>
          ))}
        </ImageList>
      )
    })
  }

  const setSlug = (slug: string) => {
    videoService.setSlug(video.id, slug).then(() => {
      router.reload()
    })
  }

  if (hidden) return null

  return (
    <Button size='small' variant='outlined' onClick={viewSlugs}>
      Missing Slug
    </Button>
  )
}

type HeaderCoverProps = {
  video: Video
  hidden?: boolean
}
const HeaderCover = ({ video, hidden = false }: HeaderCoverProps) => {
  const router = useRouter()

  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(true)

    videoService.setThumbnail(video.id).then(() => {
      if (settingsConfig.userAction.thumbnail.reload) {
        router.reload()
      } else if (settingsConfig.userAction.thumbnail.close) {
        window.close()
      }
    })
  }

  if (hidden) return null

  return (
    <Button size='small' variant='outlined' disabled={clicked} onClick={handleClick}>
      Missing Cover
    </Button>
  )
}

type ValidateTitleProps = {
  video: Video
  hidden: boolean
  onModal: ModalHandler
}
const ValidateTitle = ({ video, hidden, onModal }: ValidateTitleProps) => {
  const [disabled, setDisabled] = useState(hidden)
  const [value, setValue] = useState('Validate Title')

  const handleClick = () => {
    setValue('Loading...')
    videoService.getVideoInfo(video.id).then(({ data }) => {
      if (data.title.toLowerCase().trim() === video.name.toLowerCase().trim()) {
        setValue('Updating...')
        videoService.validateTitle(video.id).then(() => {
          setDisabled(true)
        })
      } else {
        setValue('Validate Title')
        onModal(
          'Validate Title',
          <>
            <pre>{video.name}</pre> does not match <pre>{data.title}</pre>
            <Button
              size='small'
              variant='contained'
              color='warning'
              onClick={() => {
                onModal()
                setValue('Updating...')
                videoService.validateTitle(video.id).then(() => {
                  setDisabled(true)
                })
              }}
            >
              Override?
            </Button>
          </>
        )
      }
    })
  }

  if (disabled) return null

  return (
    <Button size='small' variant='outlined' onClick={handleClick}>
      {value}
    </Button>
  )
}

type HeaderLocationsProps = {
  video: Video
  update: SetState<Video | undefined>
}
const HeaderLocations = ({ video, update }: HeaderLocationsProps) => {
  const removeLocation = (location: General) => {
    locationService.removeVideo(video.id, location.id).then(() => {
      update({ ...video, locations: video.locations.filter(item => item.id !== location.id) })
    })
  }

  return (
    <>
      {video.locations
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(location => (
          <Button
            key={location.id}
            size='small'
            variant='outlined'
            color='secondary'
            className={styles.location}
            onClick={() => removeLocation(location)}
          >
                <Icon code='map' />
            {location.name}
              </Button>
        ))}
    </>
  )
}

type HeaderAttributesProps = {
  video: Video
  update: SetState<Video | undefined>
}
const HeaderAttributes = ({ video, update }: HeaderAttributesProps) => {
  const removeAttribute = (attribute: General) => {
    attributeService.removeVideo(video.id, attribute.id).then(() => {
      update({ ...video, attributes: video.attributes.filter(item => item.id !== attribute.id) })
    })
  }

  return (
    <>
      {video.attributes
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(attribute => (
          <Button
            key={attribute.id}
            size='small'
            variant='outlined'
            color='primary'
            className={styles.attribute}
            onClick={() => removeAttribute(attribute)}
          >
                <Icon code='tag' />
            {attribute.name}
              </Button>
        ))}
    </>
  )
}

type HeaderDateProps = {
  video: Video
}
const HeaderDate = ({ video }: HeaderDateProps) => {
  const router = useRouter()

  const fixDate = () => {
    videoService.fixDate(video.id).then(() => {
      router.reload()
    })
  }

  const isInvalid = video.slug !== null && video.date.apiDate !== video.date.published

  return (
    <>
      <ContextMenuTrigger id='menu__date' className='d-inline-block'>
        <Button size='small' variant='outlined' color={isInvalid ? 'error' : undefined}>
          <Icon code='calendar' />
          {isInvalid ? 'INVALID_DATE' : video.date.published}
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu__date'>
        <IconWithText component={MenuItem} icon='sync' text='Refresh Date' onClick={fixDate} />
      </ContextMenu>
    </>
  )
}

type HeaderTitleProps = {
  video: Video
  attributes?: General[]
  locations?: General[]
  update: SetState<Video | undefined>
  onModal: ModalHandler
}
const HeaderTitle = ({ video, attributes, locations, update, onModal }: HeaderTitleProps) => {
  const [, setClipboard] = useCopyToClipboard()

  const addLocationHandler = (location: General) => {
    videoService.addLocation(video.id, location.id).then(({ data }) => {
      update({
        ...video,
        locations: [...video.locations, data].sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
      })
    })
  }

  const addAttribute = (attribute: General) => {
    videoService.addAttribute(video.id, attribute.id).then(({ data }) => {
      update({ ...video, attributes: [...video.attributes, data].sort((a, b) => a.name.localeCompare(b.name)) })
    })
  }

  const renameTitle = (title: string) => {
    videoService.renameTitle(video.id, title).then(() => update({ ...video, name: title }))
  }

  const copyTitle = async () => await setClipboard(video.name)
  const copyStar = async () => await setClipboard(video.star)

  if (attributes === undefined || locations === undefined) return <Spinner />

  return (
    <Typography variant='h4'>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <IconWithText
          component={MenuItem}
          icon='edit'
          text='Rename Title'
          onClick={() => {
            onModal(
              'Change Title',
              <TextField
                variant='outlined'
                label='Title'
                defaultValue={video.name}
                autoFocus
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    onModal()

                    renameTitle((e.target as HTMLInputElement).value)
                  }
                }}
                className='wide'
              />
            )
          }}
        />

        <IconWithText
          component={MenuItem}
          icon='add'
          text='Add Attribute'
          onClick={() => {
            onModal(
              'Add Attribute',
              attributes
                .filter(item => !video.attributes.some(videoAttribute => videoAttribute.name === item.name))
                .map(item => (
                  <Button
                    variant='outlined'
                    color='primary'
                    key={item.id}
                    onClick={() => {
                      onModal()
                      addAttribute(item)
                    }}
                  >
                    {item.name}
                  </Button>
                )),
              true
            )
          }}
        />

        <IconWithText
          component={MenuItem}
          icon='add-map'
          text='Add Location'
          onClick={() => {
            onModal(
              'Add Location',
              locations
                .filter(item => {
                  const match = video.locations.some(videoLocation => videoLocation.name === item.name)

                  if (!match) return item
                  return null
                })
                .map(item => (
                  <Button
                    variant='outlined'
                    color='primary'
                    key={item.id}
                    onClick={() => {
                      onModal()
                      addLocationHandler(item)
                    }}
                  >
                    {item.name}
                  </Button>
                )),
              true
            )
          }}
        />

        <hr />

        <IconWithText component={MenuItem} icon='copy' text='Copy Title' onClick={() => void copyTitle()} />
        <IconWithText component={MenuItem} icon='person' text='Copy Star' onClick={() => void copyStar()} />
      </ContextMenu>
    </Typography>
  )
}

export default Header
