import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'

import { Button, Grid, TextField, Typography } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useCopyToClipboard } from 'usehooks-ts'

import Icon from '../icon'
import type { ModalHandler } from '../modal'
import Spinner from '../spinner'

import { attributeService, locationService, videoService } from '@service'
import { General, SetState, Video } from '@interfaces'

import styles from './header.module.scss'

type HeaderProps = {
  video: Video
  attributes?: General[]
  locations?: General[]
  update: SetState<Video | undefined>
  onModal: ModalHandler
}
const Header = ({ video, attributes, locations, update, onModal }: HeaderProps) => {
  const isFullHD = video.height ? video.height > 720 : false

  return (
    <Grid container component='header' id={styles.header}>
      <Grid item>
        <HeaderTitle video={video} attributes={attributes} locations={locations} update={update} onModal={onModal} />

        <HeaderQuality video={video} hidden={!isFullHD} />
        <HeaderSlug video={video} hidden={video.slug !== null} onModal={onModal} />
        <HeaderCover video={video} hidden={video.image !== null || video.slug === null} />

        <HeaderDate video={video} />

        <HeaderLocations video={video} update={update} />
        <HeaderAttributes video={video} update={update} />

        <HeaderSite video={video} />
      </Grid>
    </Grid>
  )
}

type HeaderSiteProps = {
  video: Video
}
const HeaderSite = ({ video }: HeaderSiteProps) => (
  <div id={styles.site}>
    <span id={styles.wsite}>{video.website}</span>
    {video.subsite && (
      <>
        <span className='divider'>-</span>
        <span id={styles.site}>{video.subsite}</span>
      </>
    )}
  </div>
)

type HeaderQualityProps = {
  video: IVideo
  hidden?: boolean
}
const HeaderQuality = ({ video, hidden = false }: HeaderQualityProps) => {
  if (hidden) return null

  return (
    <Button size='small' variant='outlined'>
      <Icon code='film' className='mr-0' /> {video.height}
    </Button>
  )
}

type HeaderSlugProps = {
  video: Video
  hidden?: boolean
  onModal: ModalHandler
}
const HeaderSlug = ({ video, hidden = false, onModal }: HeaderSlugProps) => {
  const router = useRouter()

  const setSlug = (slug: string) => {
    videoService.setSlug(video.id, slug).then(() => {
      router.reload()
    })
  }

  if (hidden) return null

  return (
    <Button
      size='small'
      variant='outlined'
      onClick={() => {
        onModal(
          'Set Slug',
          <TextField
            variant='outlined'
            label='Slug'
            autoFocus
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === 'Enter') {
                setSlug((e.target as HTMLInputElement).value)
              }
            }}
          />
        )
      }}
    >
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
      router.reload()
    })
  }

  if (hidden) return null

  return (
    <Button size='small' variant='outlined' disabled={clicked} onClick={handleClick}>
      Missing Cover
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
    <div id={styles.locations}>
      {video.locations
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(item => (
          <Fragment key={item.id}>
            <ContextMenuTrigger id={`location-${item.id}`} renderTag='span'>
              <Button size='small' variant='outlined' color='secondary'>
                <Icon code='map' />
                {item.name}
              </Button>
            </ContextMenuTrigger>

            <ContextMenu id={`location-${item.id}`}>
              <MenuItem onClick={() => removeLocation(item)}>
                <Icon code='trash' /> Remove
              </MenuItem>
            </ContextMenu>
          </Fragment>
        ))}
    </div>
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
    <div id={styles.attributes}>
      {video.attributes
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(item => (
          <Fragment key={item.id}>
            <ContextMenuTrigger id={`attribute-${item.id}`} renderTag='span'>
              <Button size='small' variant='outlined' color='primary'>
                <Icon code='tag' />
                {item.name}
              </Button>
            </ContextMenuTrigger>

            <ContextMenu id={`attribute-${item.id}`}>
              <MenuItem onClick={() => removeAttribute(item)}>
                <Icon code='trash' /> Remove
              </MenuItem>
            </ContextMenu>
          </Fragment>
        ))}
    </div>
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

  return (
    <>
      <ContextMenuTrigger id='menu__date' renderTag='span'>
        <Button size='small' variant='outlined' id={styles.date}>
          <Icon code='calendar' />
          {video.date.invalid ? 'INVALID_DATE' : video.date.published}
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu__date'>
        <MenuItem onClick={() => fixDate()}>
          <Icon code='sync' /> Refresh Date
        </MenuItem>
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
    <Typography variant='h4' id={styles.title}>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <MenuItem
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
        >
          <Icon code='edit' /> Rename Title
        </MenuItem>

        <MenuItem
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
        >
          <Icon code='tag' /> Add Attribute
        </MenuItem>

        <MenuItem
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
        >
          <Icon code='map' /> Add Location
        </MenuItem>

        <MenuItem divider />

        <MenuItem onClick={() => void copyTitle()}>
          <Icon code='copy' /> Copy Title
        </MenuItem>

        <MenuItem onClick={() => void copyStar()}>
          <Icon code='user' /> Copy Star
        </MenuItem>
      </ContextMenu>
    </Typography>
  )
}

export default Header
