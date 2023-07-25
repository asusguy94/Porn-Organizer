'use client'

import { useRouter } from 'next/navigation'
import { NextPage } from 'next/types'
import React, { useState, useEffect } from 'react'

import { Button, TextField, Grid, Card, CardContent, Typography, ImageList, ImageListItem } from '@mui/material'

import { ContextMenuTrigger, ContextMenu, ContextMenuItem as MenuItem } from 'rctx-contextmenu'
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
import { SetState, Similar, StarVideo } from '@interfaces'
import { starService } from '@service'

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

const StarPage: NextPage<{
  breast: string[]
  haircolor: string[]
  ethnicity: string[]
  websites: string[]
  star: Star
  videos: StarVideo[]
}> = ({ breast, haircolor, ethnicity, videos, star: starData }) => {
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

          <StarForm starData={{ breast, ethnicity, haircolor }} star={star} update={setStar} />
        </div>

        <Grid item xs={12} marginRight='1em'>
          <StarVideos videos={videos} />
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
      router.refresh()
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

        <IconWithText component={MenuItem} icon='copy' text='Copy Star' onClick={copy} />
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
          <Link key={star.id} href={`/star/${star.id}`} className={styles.star}>
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
  starData: Partial<{
    breast: string[]
    ethnicity: string[]
    haircolor: string[]
  }>
  update: SetState<Star | undefined>
}
const StarForm = ({ star, starData, update }: StarFormProps) => {
  const router = useRouter()

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
        router.refresh()
      } else {
        if (typeof data.content === 'string') value = data.content

        update({ ...star, info: { ...star.info, [label]: value }, similar: data.similar })
      }
    })
  }

  const resetData = () => {
    starService.resetInfo(star.id).then(() => {
      router.refresh()
    })
  }

  const getData = () => {
    starService.getData(star.id).then(() => {
      router.refresh()
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

export default StarPage
