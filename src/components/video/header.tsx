import { useState } from 'react'

import { Button, Grid, ImageList, ImageListItem, TextField, Typography } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useCopyToClipboard } from 'usehooks-ts'

import Icon, { IconWithText } from '../icon'
import { ModalHandler } from '../modal'

import { settingsConfig } from '@/config'
import { General, Video } from '@/interface'
import { attributeService, locationService, videoService } from '@/service'
import { formatDate } from '@/utils'

import styles from './header.module.scss'

type HeaderProps = {
  video: Video
  onModal: ModalHandler
}
export default function Header({ video, onModal }: HeaderProps) {
  return (
    <Grid container>
      <Grid container item alignItems='center' component='header' id={styles.header}>
        <HeaderTitle video={video} onModal={onModal} />

        <HeaderSlug video={video} hidden={video.slug !== null} onModal={onModal} />
        <HeaderCover video={video} hidden={video.image !== null || video.slug === null} />
        <ValidateTitle video={video} hidden={video.validated || video.slug === null} onModal={onModal} />

        <HeaderDate video={video} />

        <HeaderLocations video={video} />
        <HeaderAttributes video={video} />
        <HeaderSite video={video} />
      </Grid>
    </Grid>
  )
}

type HeaderSiteProps = {
  video: Video
}
function HeaderSite({ video }: HeaderSiteProps) {
  return (
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
}

type HeaderSlugProps = {
  video: Video
  hidden?: boolean
  onModal: ModalHandler
}
function HeaderSlug({ video, hidden = false, onModal }: HeaderSlugProps) {
  const viewSlugs = () => {
    const GAP = 4
    const MAX_ROWS = 4
    const MAX_COLS = 8

    const calcCols = (images: unknown[]) => Math.min(Math.ceil(images.length / Math.floor(MAX_ROWS)), MAX_COLS)
    const calcRows = (images: unknown[]) => Math.min(images.length, MAX_ROWS)

    videoService.getSlugs(video.id).then(data => {
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
          {data.map(item => {
            const title = item.title.length <= 30 ? item.title : `${item.title.substring(0, 30 - 3)}...`

            return (
              <ImageListItem
                key={item.id}
                onClick={() => {
                  setSlug(item.id)
                  onModal()
                }}
                style={{ alignItems: 'center' }}
              >
                <pre>{title}</pre>
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
            )
          })}
        </ImageList>
      )
    })
  }

  const setSlug = (slug: string) => {
    videoService.setSlug(video.id, slug).then(() => {
      location.reload()
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
function HeaderCover({ video, hidden = false }: HeaderCoverProps) {
  const [clicked, setClicked] = useState(false)

  const handleClick = () => {
    setClicked(true)

    videoService.setThumbnail(video.id).then(() => {
      if (settingsConfig.userAction.thumbnail.close) {
        window.close()
      } else {
        location.reload()
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
function ValidateTitle({ video, hidden, onModal }: ValidateTitleProps) {
  const [disabled, setDisabled] = useState(hidden)
  const [value, setValue] = useState('Validate Title')

  const handleClick = () => {
    setValue('Loading...')
    videoService.getVideoInfo(video.id).then(data => {
      const title = data.title.replace(/ - S\d{1,2}:E\d{1,2}$/, '')

      const compare = (title: string, apiTitle: string): boolean => {
        const words = title.split(' ')
        const apiWords = apiTitle.split(' ')

        if (words.length !== apiWords.length) return false

        for (let i = 0; i < words.length; i++) {
          const word = words[i]
          const apiWord = apiWords[i]

          if (word.toUpperCase() === word && word.toLowerCase() === apiWord.toLowerCase()) {
            continue
          }

          if (apiWord.toUpperCase() === apiWord && apiWord.toLowerCase() === word.toLowerCase()) {
            return false
          }

          if (word === apiWord) {
            continue
          }

          return false
        }

        return true
      }

      if (compare(video.name, title)) {
        setValue('Updating...')
        videoService.validateTitle(video.id).then(() => {
          setDisabled(true)
        })
      } else {
        const allowRename = video.name.length === title.length && video.name.toLowerCase() === title.toLowerCase()

        setValue('Validate Title')
        onModal(
          'Validate Title',
          <>
            <pre>{video.name}</pre> does not match <pre>{title}</pre>
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
            {allowRename && (
              <Button
                size='small'
                variant='contained'
                color='info'
                onClick={() => {
                  onModal()
                  setValue('Updating...')
                  videoService.renameTitle(video.id, title).then(() => {
                    videoService.validateTitle(video.id).then(() => {
                      // setDisabled(true)
                      location.reload() // mutation should fix this
                    })
                  })
                }}
              >
                Update Case
              </Button>
            )}
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
}
function HeaderLocations({ video }: HeaderLocationsProps) {
  const { mutate } = locationService.useRemoveVideo(video.id)

  const removeLocation = (location: General) => {
    mutate({ locationId: location.id })
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
}
function HeaderAttributes({ video }: HeaderAttributesProps) {
  const { mutate } = attributeService.useRemoveVideo(video.id)

  const removeAttribute = (attribute: General) => {
    mutate({ attributeId: attribute.id })
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
function HeaderDate({ video }: HeaderDateProps) {
  const fixDate = () => {
    videoService.fixDate(video.id).then(() => {
      location.reload()
    })
  }

  const autoRename = () => {
    if (video.date.apiDate !== null) {
      const newDate = formatDate(video.date.apiDate, true, 1)

      const newFileName = video.path.file.replace(/\{.*?\}/, `{${newDate}}`)
      videoService.rename(video.id, newFileName).then(() => fixDate())
    }
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
        <IconWithText component={ContextMenuItem} icon='sync' text='Refresh Date' onClick={fixDate} />
        <IconWithText
          component={ContextMenuItem}
          icon='edit'
          text='Auto Rename (EXPERIMENTAL)'
          onClick={autoRename}
          disabled={!isInvalid}
        />
      </ContextMenu>
    </>
  )
}

type HeaderTitleProps = {
  video: Video
  onModal: ModalHandler
}
function HeaderTitle({ video, onModal }: HeaderTitleProps) {
  const { data: attributes } = attributeService.useAll()
  const { data: locations } = locationService.useAll()
  const { mutate: mutateLocation } = videoService.useAddLocation(video.id)
  const { mutate: mutateAttribute } = videoService.useAddAttribute(video.id)
  const { mutate: mutateTitle } = videoService.useRenameTitle(video.id)

  const [, setClipboard] = useCopyToClipboard()

  const addLocationHandler = (location: General) => {
    mutateLocation({ locationID: location.id })
  }

  const addAttribute = (attribute: General) => {
    mutateAttribute({ attributeID: attribute.id })
  }

  const renameTitle = (title: string) => {
    mutateTitle({ title })
  }

  const copyTitle = () => {
    setClipboard(video.name)
  }

  const copyStar = () => {
    setClipboard(video.star)
  }

  return (
    <Typography variant='h4'>
      <div className='d-inline-block'>
        <ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
      </div>

      <ContextMenu id='title'>
        <IconWithText
          component={ContextMenuItem}
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
          component={ContextMenuItem}
          icon='add'
          text='Add Attribute'
          onClick={() => {
            onModal(
              'Add Attribute',
              attributes
                ?.filter(attribute => video.attributes.every(attr => attr.name !== attribute.name))
                .map(attribute => (
                  <Button
                    variant='outlined'
                    color='primary'
                    key={attribute.id}
                    onClick={() => {
                      onModal()
                      addAttribute(attribute)
                    }}
                  >
                    {attribute.name}
                  </Button>
                )),
              true
            )
          }}
        />

        <IconWithText
          component={ContextMenuItem}
          icon='add-map'
          text='Add Location'
          onClick={() => {
            onModal(
              'Add Location',
              locations
                ?.filter(location => video.locations.every(loc => loc.name !== location.name))
                .map(location => (
                  <Button
                    variant='outlined'
                    color='primary'
                    key={location.id}
                    onClick={() => {
                      onModal()
                      addLocationHandler(location)
                    }}
                  >
                    {location.name}
                  </Button>
                )),
              true
            )
          }}
        />

        <hr />

        <IconWithText component={ContextMenuItem} icon='copy' text='Copy Title' onClick={copyTitle} />
        <IconWithText component={ContextMenuItem} icon='person' text='Copy Star' onClick={copyStar} />
      </ContextMenu>
    </Typography>
  )
}
