'use client'

import { useParams, useRouter } from 'next/navigation'

import { Button, TextField, Grid, Card, CardContent, Typography, ImageList, ImageListItem } from '@mui/material'

import { useQueryClient } from '@tanstack/react-query'
import { ContextMenuTrigger, ContextMenu, ContextMenuItem } from 'rctx-contextmenu'
import { LazyLoadImage } from 'react-lazy-load-image-component'
import { useCopyToClipboard } from 'usehooks-ts'

import Dropbox from '@components/dropbox'
import { IconWithText } from '@components/icon'
import Image, { ImageCard } from '@components/image'
import Link from '@components/link'
import ModalComponent, { ModalHandler, useModal } from '@components/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Spinner from '@components/spinner'

import StarInputForm, { InputFormData } from './input-form'
import StarVideos from './videos'

import { serverConfig } from '@config'
import { Similar, Star } from '@interfaces'
import { starService } from '@service'
import validate, { z } from '@utils/server/validation'
import { mutateAndInvalidate } from '@utils/shared'

import styles from './star.module.scss'

export default function StarPage() {
  const params = useParams<{ id: string }>()
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { data: star } = starService.useStar(id)
  const { modal, setModal } = useModal()

  if (star === undefined) return <Spinner />

  return (
    <Grid container style={{ marginTop: 12 }}>
      <Grid item xs={7}>
        <div id={styles.star}>
          <StarImageDropbox star={star} onModal={setModal} />
          <StarTitle star={star} onModal={setModal} />
          <StarForm star={star} />
        </div>

        <Grid item xs={12} marginRight='1em'>
          <StarVideos star={star} />
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

  const copy = async () => await setClipboard(star.name)

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
          {similar.map((star, idx) => (
            <Link key={star.id} href={`/star/${star.id}`} className={styles.star}>
              <RibbonContainer component={Card}>
                <ImageCard
                  src={`${serverConfig.legacyApi}/star/${star.id}/image`}
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
}

type StarImageDropboxProps = {
  star: Star
  onModal: ModalHandler
}
function StarImageDropbox({ star, onModal }: StarImageDropboxProps) {
  const router = useRouter()
  const { mutate } = starService.useAddImage(star.id)
  const queryClient = useQueryClient()

  const removeStar = () => {
    starService.remove(star.id).then(() => {
      router.replace('/star')
    })
  }

  const removeImage = () => {
    starService.removeImage(star.id).then(() => {
      location.reload()
    })
  }

  const addImage = (url: string) => {
    mutateAndInvalidate({
      mutate,
      queryClient,
      queryKey: ['star', star.id],
      variables: { image: url }
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
              src={`${serverConfig.legacyApi}/star/${star.id}/image`}
              width={200}
              height={275}
              alt='star'
              priority
            />
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

  const addHaircolor = (name: string) => {
    starService.addHaircolor(star.id, name).then(() => {
      location.reload()
    })
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
