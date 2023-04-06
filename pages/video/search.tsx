import type { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import { Card, CardActionArea, FormControl, Grid, RadioGroup, TextField, Typography } from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'
import { useReadLocalStorage } from 'usehooks-ts'

import { ImageCard } from '@components/image'
import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import { getVisible, HiddenVideo as Hidden, VideoSearch as Video } from '@components/search/helper'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner'
import SortObj, { getVideoSort, SortMethodVideo, SortTypeVideo as VideoSort } from '@components/search/sort'
import Link from '@components/link'

import { daysToYears } from '@utils/client/date-time'
import { SetState, General, LocalWebsite } from '@interfaces'
import { attributeService, categoryService, locationService, searchService } from '@service'
import { serverConfig } from '@config'
import { printWithMax } from '@utils/shared'

import styles from './search.module.scss'

const VideoSearchPage: NextPage = () => {
  const [sort, setSort] = useState<VideoSort>({ type: 'date', reverse: false })
  const [hidden, setHidden] = useState<Hidden>({
    titleSearch: '',
    category: [null],
    attribute: [],
    location: [],
    website: ''
  })

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar setHidden={setHidden} setSort={setSort} />
      </Grid>

      <Grid item xs={10}>
        <Videos hidden={hidden} sortMethod={getVideoSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type VideosProps = {
  hidden: Hidden
  sortMethod: SortMethodVideo
}
const Videos = ({ hidden, sortMethod }: VideosProps) => {
  const { data: videos } = searchService.useVideos()

  const localWebsites = useReadLocalStorage<LocalWebsite[]>('websites')
  const [filtered, setFiltered] = useState<Video[]>([])

  useEffect(() => {
    if (videos === undefined) return

    const map = new Map<string, number>()
    const allMap = new Map<string, number>()

    const initialData = (localWebsites !== null ? [...localWebsites] : []).map(wsite => ({
      ...wsite,
      count: wsite.finished ? wsite.count + 1 : wsite.count
    }))

    setFiltered(
      videos
        .sort(getVideoSort({ type: 'date', reverse: false }))
        .filter(v => {
          const website = initialData.find(wsite => wsite.label === v.website)

          if (website !== undefined && website.count-- > (website.finished ? 0 : 1)) {
            return true
          }

          if (v.categories.length === 0) {
            map.set(v.website, (map.get(v.website) ?? 0) + 1)
          }
          allMap.set(v.website, (allMap.get(v.website) ?? 0) + 1)

          return false

          // return v.categories.length > 0
        })
        // TODO move this as a toggle to the settings-page
        // also move the label/name to the settings page
        // add dropdown from attributes? instead of input-field?
        .filter(v => !v.attributes.includes('video-unplayable')) //FIXME broken file/stream?
    )

    console.clear()
    const selectedMap = [...(map.size > 0 ? map : allMap)]
    selectedMap.slice(0, 2).forEach(([key, value]) => console.log(key, printWithMax(value, 200)))
  }, [localWebsites, videos, hidden])

  if (videos === undefined) return <Spinner />

  const visible = getVisible(filtered.sort(sortMethod), hidden)

  return (
    <div id={styles.videos}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Videos
      </Typography>

      <VGrid itemHeight={300} total={visible.length} renderData={idx => <VideoCard video={visible[idx]} />} />
    </div>
  )
}

type VideoCardProps = {
  video?: Video
}
const VideoCard = ({ video }: VideoCardProps) => {
  if (video === undefined) return null

  return (
    <Link href={{ pathname: '/video/[id]', query: { id: video.id } }}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <ImageCard
            src={`${serverConfig.api}/video/${video.id}/image`}
            width={290}
            height={170}
            missing={video.image === null}
            scale={5}
            alt='video'
          />

          <Grid container justifyContent='center' className={styles.title}>
            <Typography className='text-center'>{video.name}</Typography>
          </Grid>

          <Ribbon label={daysToYears(video.ageInVideo)} />
        </CardActionArea>
      </RibbonContainer>
    </Link>
  )
}

type SidebarProps = {
  setHidden: SetState<Hidden>
  setSort: SetState<VideoSort>
}
const Sidebar = ({ setHidden, setSort }: SidebarProps) => (
  <>
    <TitleSearch setHidden={setHidden} />
    <Sort setSort={setSort} />
    <Filter setHidden={setHidden} />
  </>
)

type TitleSearchProps = {
  setHidden: SetState<Hidden>
}
const TitleSearch = ({ setHidden }: TitleSearchProps) => {
  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.currentTarget.value.toLowerCase()

    setHidden(prev => ({ ...prev, titleSearch: searchValue }))
  }

  return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} />
}

type SortProps = {
  setSort: SetState<VideoSort>
}
const Sort = ({ setSort }: SortProps) => {
  const sortDefault = (reverse = false) => setSort({ type: 'alphabetically', reverse })
  const sortAdded = (reverse = false) => setSort({ type: 'added', reverse })
  const sortDate = (reverse = false) => setSort({ type: 'date', reverse })
  const sortAge = (reverse = false) => setSort({ type: 'age', reverse })
  const sortPlays = (reverse = false) => setSort({ type: 'plays', reverse })
  const sortTitleLength = (reverse = false) => setSort({ type: 'title-length', reverse })

  return (
    <>
      <h2>Sort</h2>
      <FormControl>
        <RadioGroup name='sort' defaultValue='date_reverse'>
          <SortObj id='alphabetically' label={{ asc: 'A-Z', desc: 'Z-A' }} callback={sortDefault} />
          <SortObj id='added' label={{ asc: 'Old Upload', desc: 'Recent Upload' }} callback={sortAdded} reversed />
          <SortObj id='date' label={{ asc: 'Oldest', desc: 'Newest' }} callback={sortDate} reversed />
          <SortObj id='age' label={{ asc: 'Teen', desc: 'Milf' }} callback={sortAge} />
          <SortObj id='plays' label={{ asc: 'Least Popular', desc: 'Most Popular' }} callback={sortPlays} reversed />
          <SortObj
            id='title-len'
            label={{ asc: 'Shortest Title', desc: 'Longest Title' }}
            callback={sortTitleLength}
            reversed
          />
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterProps = {
  setHidden: SetState<Hidden>
}
const Filter = ({ setHidden }: FilterProps) => {
  const { data: attributes } = attributeService.useAttributes()
  const { data: categories } = categoryService.useCategories()
  const { data: locations } = locationService.useLocations()

  const category = (ref: RegularHandlerProps, target: General) => {
    const targetLower = target.name.toLowerCase()

    if (!ref.checked) {
      setHidden(prev => ({ ...prev, category: prev.category.filter(cat => cat !== targetLower) }))
    } else {
      setHidden(prev => ({ ...prev, category: [...prev.category, targetLower] }))
    }
  }

  const attribute = (ref: RegularHandlerProps, target: General) => {
    const targetLower = target.name.toLowerCase()

    if (!ref.checked) {
      setHidden(prev => ({ ...prev, attribute: prev.attribute.filter(attr => attr !== targetLower) }))
    } else {
      setHidden(prev => ({ ...prev, attribute: [...prev.attribute, targetLower] }))
    }
  }

  const location = (ref: RegularHandlerProps, target: General) => {
    const targetLower = target.name.toLowerCase()

    if (!ref.checked) {
      setHidden(prev => ({ ...prev, location: prev.location.filter(loc => loc !== targetLower) }))
    } else {
      setHidden(prev => ({ ...prev, location: [...prev.location, targetLower] }))
    }
  }

  const category_NULL = (ref: RegularHandlerProps) => {
    if (!ref.checked) {
      setHidden(prev => ({ ...prev, category: prev.category.filter(category => category !== null) }))
    } else {
      setHidden(prev => ({ ...prev, category: [...prev.category, null] }))
    }
  }

  return (
    <>
      {/* <WebsiteDropdown websites={videoData.websites} label='website' callback={website} /> */}

      <FilterObj data={categories} label='category' callback={category} nullCallback={category_NULL} defaultNull />

      <FilterObj data={attributes} label='attribute' callback={attribute} />
      <FilterObj data={locations} label='location' callback={location} />
    </>
  )
}

type FilterObjProps<T extends General> = {
  data?: T[]
  label: string
  callback: (ref: RegularHandlerProps, item: T) => void
  nullCallback?: (ref: RegularHandlerProps) => void
  otherCallback?: { label: string; cb: (ref: RegularHandlerProps) => void }
  defaultNull?: boolean
  defaultOther?: boolean
}
function FilterObj<T extends General>({ data, label, callback, nullCallback, defaultNull = false }: FilterObjProps<T>) {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        {nullCallback !== undefined && (
          <RegularItem
            label={<div className={styles.global}>NULL</div>}
            value='NULL'
            callback={nullCallback}
            defaultChecked={defaultNull}
          />
        )}

        {data.map(item => (
          <RegularItem key={item.id} label={item.name} value={item.name} item={item} callback={callback} />
        ))}
      </FormControl>
    </>
  )
}

export default VideoSearchPage
