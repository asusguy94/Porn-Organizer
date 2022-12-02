import { Fragment } from 'react'

import { Button, Grid, TextField, Typography } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useCopyToClipboard } from 'usehooks-ts'

import Icon from '../icon'
import type { IModalHandler } from '../modal'

import { attributeApi, locationApi, videoApi } from '@api'
import { IGeneral, ISetState, IVideo } from '@interfaces'

import styles from './header.module.scss'

interface HeaderProps {
  video: IVideo
  attributes: IGeneral[]
  locations: IGeneral[]
  update: ISetState<IVideo | undefined>
  onModal: IModalHandler
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

interface HeaderSiteProps {
  video: IVideo
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

interface HeaderQualityProps {
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

interface HeaderSlugProps {
  video: IVideo
  hidden?: boolean
  onModal: IModalHandler
}
const HeaderSlug = ({ video, hidden = false, onModal }: HeaderSlugProps) => {
  const setSlug = (slug: string) => {
    videoApi.setSlug(video.id, slug).then(() => {
      window.location.reload()
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

interface HeaderCoverProps {
  video: IVideo
  hidden?: boolean
}
const HeaderCover = ({ video, hidden = false }: HeaderCoverProps) => {
  const setCover = () => {
    videoApi.setThumbnail(video.id).then(() => {
      window.location.reload()
    })
  }

  if (hidden) return null

  return (
    <Button size='small' variant='outlined' onClick={() => setCover()}>
      Missing Cover
    </Button>
  )
}

interface HeaderLocationsProps {
  video: IVideo
  update: ISetState<IVideo | undefined>
}
const HeaderLocations = ({ video, update }: HeaderLocationsProps) => {
  const removeLocation = (location: IGeneral) => {
    locationApi.removeVideo(video.id, location.id).then(() => {
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

interface HeaderAttributesProps {
  video: IVideo
  update: ISetState<IVideo | undefined>
}
const HeaderAttributes = ({ video, update }: HeaderAttributesProps) => {
  const removeAttribute = (attribute: IGeneral) => {
    attributeApi.removeVideo(video.id, attribute.id).then(() => {
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

interface HeaderDateProps {
  video: IVideo
}
const HeaderDate = ({ video }: HeaderDateProps) => {
  const fixDate = () => {
    videoApi.fixDate(video.id).then(() => {
      window.location.reload()
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

interface HeaderTitleProps {
  video: IVideo
  attributes: IGeneral[]
  locations: IGeneral[]
  update: ISetState<IVideo | undefined>
  onModal: IModalHandler
}
const HeaderTitle = ({ video, attributes, locations, update, onModal }: HeaderTitleProps) => {
  const [, setClipboard] = useCopyToClipboard()

  const addLocationHandler = (location: IGeneral) => {
    videoApi.addLocation(video.id, location.id).then(({ data }) => {
      update({
        ...video,
        locations: [...video.locations, data].sort((a, b) => {
          return a.name.localeCompare(b.name)
        })
      })
    })
  }

  const addAttribute = (attribute: IGeneral) => {
    videoApi.addAttribute(video.id, attribute.id).then(({ data }) => {
      update({ ...video, attributes: [...video.attributes, data].sort((a, b) => a.name.localeCompare(b.name)) })
    })
  }

  const renameTitle = (title: string) => {
    videoApi.renameTitle(video.id, title).then(() => update({ ...video, name: title }))
  }

  const copyTitle = async () => await setClipboard(video.name)
  const copyStar = async () => await setClipboard(video.star)

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
                .filter(item => {
                  const match = video.attributes.some(videoAttribute => videoAttribute.name === item.name)

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
