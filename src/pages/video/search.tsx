import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import {
  Card,
  CardActionArea,
  FormControl,
  Grid,
  MenuItem,
  RadioGroup,
  Select,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'

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
import { serverConfig } from '@config'
import prisma from '@utils/server/prisma'

import { searchService } from '@service'

import styles from './search.module.scss'

export const getServerSideProps: GetServerSideProps<{
  attributes: General[]
  categories: General[]
  locations: General[]
  websites: General[]
}> = async () => {
  const attributes = await prisma.attribute.findMany()
  const locations = await prisma.location.findMany()
  const categories = await prisma.category.findMany()
  const websites = await prisma.website.findMany()

  return {
    props: {
      attributes,
      locations,
      categories,
      websites
    }
  }
}

const VideoSearchPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  attributes,
  categories,
  locations,
  websites
}) => {
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
        <Sidebar
          attributes={attributes}
          categories={categories}
          locations={locations}
          websites={websites}
          setHidden={setHidden}
          setSort={setSort}
        />
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
  const localWebsites = useReadLocalStorage<LocalWebsite[]>('websites')
  const [filtered, setFiltered] = useState<Video[]>([])
  const [data, setData] = useState<{ label: string; count: number }[]>([])

  const { data: videos } = searchService.useVideos()

  useEffect(() => {
    if (videos === undefined) return

    const map = new Map<string, number>()

    const initialData = (localWebsites !== null ? [...localWebsites] : []).map(wsite => ({
      ...wsite,
      count: wsite.finished ? wsite.count + 1 : wsite.count
    }))

    let stop = false
    setFiltered(
      videos
        .filter(video => !video.attributes.includes('video-unplayable')) //FIXME broken file/stream?
        .sort(getVideoSort({ type: 'date' }))
        .filter(video => {
          const website = initialData.find(wsite => wsite.label === video.website)

          if (website !== undefined && website.count-- > 1) {
            return true
          }

          if (video.categories.length === 0 && !stop) {
            const isNewWebsite = map.get(video.website) === undefined

            if (isNewWebsite && map.size >= 3) {
              // 3rd website found
              stop = true
            }

            if (!stop || !isNewWebsite) {
              // add or increment website
              map.set(video.website, (map.get(video.website) ?? 0) + 1)
            }
          }

          return false
        })
    )

    setData([...map].map(([key, value]) => ({ label: key, count: value })))
  }, [localWebsites, videos, hidden])

  if (videos === undefined) return <Spinner />

  const visible = getVisible(filtered.sort(sortMethod), hidden)

  return (
    <div id={styles.videos}>
      <Typography variant='h5' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Videos
      </Typography>

      {data.length > 0 && (
        <Typography variant='h6' className='text-center'>
          {data.map((item, idx) => (
            <span key={item.label}>
              {idx > 0 && ' - '}
              {item.label}: {item.count}
            </span>
          ))}
        </Typography>
      )}

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
  attributes: General[]
  categories: General[]
  locations: General[]
  websites: General[]
  setHidden: SetState<Hidden>
  setSort: SetState<VideoSort>
}
const Sidebar = ({ attributes, categories, locations, websites, setHidden, setSort }: SidebarProps) => (
  <>
    <TitleSearch setHidden={setHidden} />
    <Sort setSort={setSort} />
    <Filter
      attributes={attributes}
      categories={categories}
      locations={locations}
      websites={websites}
      setHidden={setHidden}
    />
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
  attributes: General[]
  categories: General[]
  locations: General[]
  websites: General[]
  setHidden: SetState<Hidden>
}
const Filter = ({ setHidden, attributes, categories, locations, websites }: FilterProps) => {
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

  const website_DROP = (e: SelectChangeEvent) => {
    const targetLower = e.target.value.toLowerCase()

    if (targetLower === 'all') {
      setHidden(prev => ({ ...prev, website: '' }))
    } else {
      setHidden(prev => ({ ...prev, website: targetLower }))
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
      <FilterDropdown data={websites} label='website' callback={website_DROP} />

      <FilterObj data={categories} label='category' callback={category} nullCallback={category_NULL} defaultNull />

      <FilterObj data={attributes} label='attribute' callback={attribute} />
      <FilterObj data={locations} label='location' callback={location} />
    </>
  )
}

type FilterDropdownProps<T extends General> = {
  data?: T[]
  label: string
  callback: (e: SelectChangeEvent) => void
}
function FilterDropdown<T extends General>({ data, label, callback }: FilterDropdownProps<T>) {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <Select variant='standard' id={label} defaultValue='ALL' onChange={callback}>
          <MenuItem value='ALL'>All</MenuItem>

          {data.map(item => (
            <MenuItem key={item.id} value={item.name}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
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
