import type { NextPage } from 'next/types'
import React, { useState, useEffect, useRef } from 'react'

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
import IndeterminateItem, { HandlerProps as IndeterminateItemProps } from '@components/indeterminate'
import LabelCount from '@components/labelcount'
import { getVisible } from '@components/search/helper'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner'
import SortObj from '@components/search/sort'
import Link from '@components/link'

import { daysToYears } from '@utils/client/date-time'
import { SetState, WebsiteWithSites as Website, General, LocalWebsite } from '@interfaces'
import { attributeService, categoryService, locationService, searchService, websiteService } from '@service'
import { serverConfig } from '@config'
import { printWithMax } from '@utils/shared'

import styles from './search.module.scss'

type VideoData = Partial<{
  categories: General[]
  attributes: General[]
  locations: General[]
  websites: Website[]
}>

const VideoSearchPage: NextPage = () => {
  const localWebsites = useReadLocalStorage<ILocalWebsite[]>('websites')

  const [videos, setVideos] = useState<IVideo[]>([])

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar
          videoData={{
            categories,
            attributes,
            locations,
            websites
          }}
          setHidden={setHidden}
        />
      </Grid>

      <Grid item xs={10}>
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type VideosProps = {
  videos?: Video[]
  hidden: Hidden
}
  const localWebsites = useReadLocalStorage<LocalWebsite[]>('websites')
  const [filtered, setFiltered] = useState<Video[]>([])

  useEffect(() => {
    if (localWebsites !== null) {
      localWebsites.map(wsite => ({ ...wsite, count: wsite.finished ? wsite.count + 1 : wsite.count }))
    }
  }, [localWebsites])

  useEffect(() => {
    const map = new Map<string, number>()

    setFiltered(
          .filter(v => {
            if (localWebsites === null) {
              return true
            } else if (v.website !== undefined) {
              const website = localWebsites.find(wsite => wsite.label === v.website)

              if (website !== undefined && website.count-- > (website.finished ? 0 : 1)) {
                return true
              }
            }

            if (v.website !== undefined) {
              map.set(v.website, (map.get(v.website) ?? 0) + 1)
            }

            return v.categories.length > 0
          })
          // TODO move this as a toggle to the settings-page
          // also move the label/name to the settings page
          // add dropdown from attributes? instead of input-field?
          .filter(v => !v.attributes.includes('video-unplayable')) //FIXME broken file/stream?
      )

      console.clear()
      ;[...map].slice(0, 2).forEach(([key, value]) => console.log(key, printWithMax(value, 200)))
  }, [localWebsites, videos, hidden])

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar
          videoData={{ categories, attributes, locations, websites }}
          videos={videos}
          update={setVideos}
          inputRef={inputRef}
        />
      </Grid>

      <Grid item xs={10}>
        {videos.length ? <Videos videos={videos} /> : <Spinner />}
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

interface VideosProps {
  videos: IVideo[]
}
const Videos = ({ videos }: VideosProps) => {
  const visibleVideos = getVisible(videos)

  return (
    <div id={styles.videos}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Videos
      </Typography>

      {videos.length > 0 ? (
        <VGrid itemHeight={300} total={visible.length} renderData={idx => <VideoCard video={visible[idx]} />} />
      ) : (
        <Spinner />
      )}
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
  videoData: VideoData
  setHidden: SetState<Hidden>
}
const Sidebar = ({ videoData, videos, update, inputRef }: SidebarProps) => (
  <>
    <TitleSearch setHidden={setHidden} />
    <Filter videoData={videoData} setHidden={setHidden} />
  </>
)

type TitleSearchProps = {
  setHidden: SetState<Hidden>
}
const TitleSearch = ({ setHidden }: TitleSearchProps) => {
  const inputRef = useRef<HTMLInputElement>()

  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.currentTarget.value.toLowerCase()

    setHidden(prev => ({ ...prev, titleSearch: searchValue }))
  }

  return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} inputRef={inputRef} />
}

interface SortProps {
  videos: IVideo[]
  update: ISetState<IVideo[]>
}
const Sort = ({ videos, update }: SortProps) => {
  const sortDefault = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
        return reverse ? result * -1 : result
      })
    )
  }

  const sortAdded = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.id - b.id
        return reverse ? result * -1 : result
      })
    )
  }

  const sortDate = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const dateA: Date = new Date(a.date)
        const dateB: Date = new Date(b.date)

        const result = dateA.getTime() - dateB.getTime()
        return reverse ? result * -1 : result
      })
    )
  }

  const sortAge = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.ageInVideo - b.ageInVideo
        return reverse ? result * -1 : result
      })
    )
  }

  const sortPlays = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.plays - b.plays
        return reverse ? result * -1 : result
      })
    )
  }

  const sortTitleLength = (reverse = false) => {
    update(
      [...videos].sort((a, b) => {
        const result = a.name.length - b.name.length
        return reverse ? result * -1 : result
      })
    )
  }

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
  videoData: VideoData
  setHidden: SetState<Hidden>
}
const Filter = ({ videoData, setHidden }: FilterProps) => {
  const website = (e: SelectChangeEvent) => {
    const websiteObj: IWebsite = JSON.parse(e.target.value)

    update(
      videos.map(video => {
        if (websiteObj.name === 'ALL') {
          return { ...video, hidden: { ...video.hidden, website: false } }
        } else if (websiteObj.sites.length === 0) {
          return {
            ...video,
            hidden: {
              ...video.hidden,
              website: !(video.website !== undefined && video.website.toLowerCase() === websiteObj.name.toLowerCase())
            }
          }
        }

        return {
          ...video,
          hidden: {
            ...video.hidden,
            website: !(video.site !== null && video.site.toLowerCase() === websiteObj.sites[0].name.toLowerCase())
          }
        }
      })
    )
  }

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
      <WebsiteDropdown websites={videoData.websites} label='website' callback={website} />

      <FilterObj
        data={videoData.categories}
        label='category'
        callback={category}
        nullCallback={category_NULL}
        defaultNull
      />

      <FilterObj data={videoData.attributes} label='attribute' callback={attribute} />
      <FilterObj data={videoData.locations} label='location' callback={location} />
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
            callback={ref => nullCallback(ref)}
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

type WebsiteDropdownProps = {
  websites?: Website[]
  label: string
  callback: (e: SelectChangeEvent) => void
  defaultValue?: string
}
const WebsiteDropdown = ({ websites, label, callback, defaultValue = 'ALL' }: WebsiteDropdownProps) => {
  if (websites === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <Select variant='standard' name={label} defaultValue={defaultValue} onChange={callback}>
          <MenuItem value='ALL'>All</MenuItem>

          {websites.map(website => [
            <MenuItem key={website.id} value={JSON.stringify({ ...website, sites: [] })}>
              {website.name}
            </MenuItem>,
            website.sites.map(site => (
              <MenuItem
                key={`${website.id}-${site.id}`}
                value={JSON.stringify({
                  ...website,
                  sites: [site]
                })}
              >
                {website.name} / {site.name}
              </MenuItem>
            ))
          ])}
        </Select>
      </FormControl>
    </>
  )
}

export default VideoSearchPage
