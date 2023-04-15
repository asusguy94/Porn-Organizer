import { useRouter } from 'next/router'
import { Fragment, useState } from 'react'

import { Button, Grid, TextField, Typography } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
import { useCopyToClipboard } from 'usehooks-ts'

import Icon, { IconWithText } from '../icon'
import type { ModalHandler } from '../modal'
import Spinner from '../spinner'

import { attributeService, locationService, videoService } from '@service'
import { General, SetState, Video } from '@interfaces'
import { settingsConfig } from '@config'

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
        .map(item => (
          <Fragment key={item.id}>
            <ContextMenuTrigger id={`location-${item.id}`} className='d-inline-block'>
              <Button size='small' variant='outlined' color='secondary'>
                <Icon code='map' />
                {item.name}
              </Button>
            </ContextMenuTrigger>

            <ContextMenu id={`location-${item.id}`}>
              <IconWithText component={MenuItem} icon='delete' text='Remove' onClick={() => removeLocation(item)} />
            </ContextMenu>
          </Fragment>
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
        .map(item => (
          <Fragment key={item.id}>
            <ContextMenuTrigger id={`attribute-${item.id}`} className='d-inline-block'>
              <Button size='small' variant='outlined' color='primary'>
                <Icon code='tag' />
                {item.name}
              </Button>
            </ContextMenuTrigger>

            <ContextMenu id={`attribute-${item.id}`}>
              <IconWithText component={MenuItem} icon='delete' text='Remove' onClick={() => removeAttribute(item)} />
            </ContextMenu>
          </Fragment>
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

  return (
    <>
      <ContextMenuTrigger id='menu__date' className='d-inline-block'>
        <Button size='small' variant='outlined'>
          <Icon code='calendar' />
          {video.date.invalid ? 'INVALID_DATE' : video.date.published}
        </Button>
      </ContextMenuTrigger>

      <ContextMenu id='menu__date'>
        <IconWithText component={MenuItem} icon='sync' text='Refresh Date' onClick={() => fixDate()} />
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
