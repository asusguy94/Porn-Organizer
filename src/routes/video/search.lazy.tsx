import { useState, useEffect } from 'react'

import {
  Card,
  CardActionArea,
  CardMedia,
  FormControl,
  Grid,
  RadioGroup,
  SelectChangeEvent,
  TextField,
  Typography
} from '@mui/material'

import { Link, createLazyFileRoute } from '@tanstack/react-router'
import ScrollToTop from 'react-scroll-to-top'
import { useReadLocalStorage } from 'usehooks-ts'

import MissingImage from '@/components/image/missing'
import { RegularHandlerProps } from '@/components/indeterminate'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import { FilterCheckbox, FilterDropdown, isDefault } from '@/components/search/filter'
import {
  SortObjVideo as SortObj,
  defaultVideoObj as defaultObj,
  getSortString,
  getVideoSort as getSort
} from '@/components/search/sort'
import Spinner from '@/components/spinner'
import VGrid from '@/components/virtualized/virtuoso'

import { serverConfig } from '@/config'
import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@/hooks/search'
import useFocus from '@/hooks/useFocus'
import { General, LocalWebsite, VideoSearch } from '@/interface'
import { attributeService, categoryService, locationService, searchService, websiteService } from '@/service'
import { daysToYears } from '@/utils/client/date-time'

import styles from './search.module.scss'

export const Route = createLazyFileRoute('/video/search')({
  component: () => (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <TitleSearch />
        <Sort />
        <Filter />
      </Grid>

      <Grid item xs={10}>
        <Videos />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
})

function TitleSearch() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { currentValue } = useSearchParam(defaultObj, 'query')

  const ref = useFocus(currentValue)

  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParam('query', e.target.value)
    update()
  }

  return <TextField inputRef={ref} variant='standard' placeholder='Name' onChange={callback} />
}

function Sort() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { sort } = useAllSearchParams(defaultObj)

  const sortAlphabetical = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-alphabetical')
    } else {
      setParam('sort', 'alphabetical')
    }
    update()
  }

  const sortAdded = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-added')
    } else {
      setParam('sort', 'added')
    }
    update()
  }

  const sortDate = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-date')
    } else {
      setParam('sort', 'date')
    }
    update()
  }

  const sortAge = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-age')
    } else {
      setParam('sort', 'age')
    }
    update()
  }

  const sortPlays = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-plays')
    } else {
      setParam('sort', 'plays')
    }
    update()
  }

  const sortTitleLength = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-title-length')
    } else {
      setParam('sort', 'title-length')
    }
    update()
  }

  return (
    <>
      <h2>Sort</h2>

      <FormControl>
        <RadioGroup name='sort' defaultValue={getSortString(sort)}>
          <SortObj id='alphabetical' labels={['A-Z', 'Z-A']} callback={sortAlphabetical} />
          <SortObj id='added' labels={['Recent Upload', 'Old Upload']} callback={sortAdded} reversed />
          <SortObj id='date' labels={['Newest', 'Oldest']} callback={sortDate} reversed />
          <SortObj id='age' labels={['Teen', 'Milf']} callback={sortAge} />
          <SortObj id='plays' labels={['Most Popular', 'Least Popular']} callback={sortPlays} reversed />
          <SortObj id='title-length' labels={['Longest Title', 'Shortest Title']} callback={sortTitleLength} reversed />
        </RadioGroup>
      </FormControl>
    </>
  )
}

function Filter() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const {
    category: categoryParam,
    attribute: attributeParam,
    location: locationParam,
    nullCategory: nullCategoryParam
  } = useAllSearchParams(defaultObj)

  const { data: websites } = websiteService.useAll()
  const { data: attributes } = attributeService.useAll()
  const { data: locations } = locationService.useAll()
  const { data: categories } = categoryService.useAll()

  const category = (ref: RegularHandlerProps, target: General) => {
    const value = target.name

    if (isDefault(categoryParam, defaultObj.category)) {
      setParam('category', value)
    } else {
      const urlParam = categoryParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(category => category !== value)
        setParam('category', filtered.toString())
      } else {
        const merged = [...urlParam, value]
        setParam('category', merged.toString())
      }
    }
    update()
  }

  const attribute = (ref: RegularHandlerProps, target: General) => {
    const value = target.name

    if (isDefault(attributeParam, defaultObj.attribute)) {
      setParam('attribute', value)
    } else {
      const urlParam = attributeParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(attribute => attribute !== value)
        setParam('attribute', filtered.toString())
      } else {
        const merged = [...urlParam, value]
        setParam('attribute', merged.toString())
      }
    }
    update()
  }

  const location = (ref: RegularHandlerProps, target: General) => {
    const value = target.name

    if (isDefault(locationParam, defaultObj.location)) {
      setParam('location', value)
    } else {
      const urlParam = locationParam.split(',')

      if (!ref.checked) {
        const filtered = urlParam.filter(location => location !== value)
        setParam('location', filtered.toString())
      } else {
        const merged = [...urlParam, value]
        setParam('location', merged.toString())
      }
    }
    update()
  }

  const website_DROP = (e: SelectChangeEvent) => {
    const value = e.target.value

    setParam('website', value)
    update()
  }

  const category_NULL = (ref: RegularHandlerProps) => {
    if (!ref.checked) {
      setParam('nullCategory', defaultObj.nullCategory)
    } else {
      setParam('nullCategory', '1')
    }
    update()
  }

  return (
    <>
      <FilterDropdown data={websites} label='website' callback={website_DROP} defaultObj={defaultObj} />

      {categories === undefined || attributes === undefined || locations === undefined ? (
        <Spinner size='small' />
      ) : (
        <>
          <FilterCheckbox
            data={categories}
            label='category'
            callback={category}
            nullCallback={category_NULL}
            defaultNull={nullCategoryParam !== defaultObj.nullCategory}
            defaultObj={defaultObj}
          />

          <FilterCheckbox data={attributes} label='attribute' callback={attribute} defaultObj={defaultObj} />
          <FilterCheckbox data={locations} label='location' callback={location} defaultObj={defaultObj} />
        </>
      )}
    </>
  )
}

function Videos() {
  const { sort, query, attribute, category, nullCategory, location, website } = useAllSearchParams(defaultObj)
  const { data: videos, isLoading } = searchService.useVideos()

  const localWebsites = useReadLocalStorage<LocalWebsite[]>('websites')
  const [filtered, setFiltered] = useState<VideoSearch[]>([])
  const [data, setData] = useState<{ label: string; count: number }[]>([])

  useEffect(() => {
    if (videos === undefined) return

    const map = new Map<string, number>()

    const initialData = (localWebsites !== null ? [...localWebsites] : []).map(wsite => ({
      ...wsite,
      count: wsite.finished ? wsite.count + 1 : wsite.count
    }))

    let stop = false
    setFiltered(
      videos.sort(getSort('date')).filter(video => {
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
  }, [localWebsites, videos])

  if (isLoading || videos === undefined) return <Spinner />

  const visible = filtered
    .sort(getSort(sort))
    .filter(v => v.name.toLowerCase().includes(query.toLowerCase()) || isDefault(query, defaultObj.query))
    .filter(
      v => category.split(',').every(cat => v.categories.includes(cat)) || isDefault(category, defaultObj.category)
    )
    .filter(
      v =>
        (nullCategory !== defaultObj.nullCategory && v.categories.length === 0) ||
        isDefault(nullCategory, defaultObj.nullCategory)
    )
    .filter(
      v => attribute.split(',').every(attr => v.attributes.includes(attr)) || isDefault(attribute, defaultObj.attribute)
    )
    .filter(
      v => location.split(',').every(loc => v.locations.includes(loc)) || isDefault(location, defaultObj.location)
    )
    .filter(v => v.website === website || isDefault(website, defaultObj.website))

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

      <VGrid itemHeight={300} total={visible.length} renderData={idx => <VideoCard video={visible.at(idx)} />} />
    </div>
  )
}

type VideoCardProps = {
  video?: VideoSearch
}
function VideoCard({ video }: VideoCardProps) {
  if (video === undefined) return null

  return (
    <Link to='/video/$videoId' params={{ videoId: video.id }}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <CardMedia style={{ height: 170, textAlign: 'center' }}>
            {video.image === null ? (
              <MissingImage renderStyle='height' scale={5} />
            ) : (
              <img
                src={`${serverConfig.newApi}/video/${video.id}/image`}
                style={{ width: '100%', height: '100%' }}
                alt='video'
              />
            )}
          </CardMedia>

          <Grid container justifyContent='center' className={styles.title}>
            <Typography className='text-center'>{video.name}</Typography>
          </Grid>

          <Ribbon label={daysToYears(video.ageInVideo)} />
        </CardActionArea>
      </RibbonContainer>
    </Link>
  )
}
