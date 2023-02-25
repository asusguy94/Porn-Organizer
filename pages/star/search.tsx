import type { NextPage } from 'next/types'
import { useState } from 'react'

import {
  Grid,
  Card,
  CardActionArea,
  Typography,
  TextField,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { daysToYears } from '@utils/client/date-time'
import { mergeSort } from '@utils/client/sort'

import { ImageCard } from '@components/image'
import { getVisible, HiddenStar as Hidden, StarSearch as Star } from '@components/search/helper'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Badge from '@components/badge'
import Spinner from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'
import Link from '@components/link'
import SortObj, { getStarSort, SortMethodStar, SortTypeStar as StarSort } from '@components/search/sort'

import { General, SetState } from '@interfaces'
import { searchService, starService, websiteService } from '@service'
import { serverConfig } from '@config'

import styles from './search.module.scss'

type StarData = Partial<{
  breasts: string[]
  haircolors: string[]
  ethnicities: string[]
  websites: General[]
}>

const StarSearchPage: NextPage = () => {
  const { data: websites } = websiteService.useWebsites()
  const { data: stars } = searchService.useStars()
  const { breast, ethnicity, haircolor } = starService.useStarInfo().data ?? {}

  const [sort, setSort] = useState<StarSort>({ type: 'alphabetically', reverse: false })
  const [hidden, setHidden] = useState<Hidden>({
    titleSearch: '',
    breast: '',
    haircolor: '',
    ethnicity: '',
    website: ''
  })

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar
          starData={{
            breasts: breast,
            haircolors: haircolor,
            ethnicities: ethnicity,
            websites: websites
          }}
          setHidden={setHidden}
          hidden={hidden}
          setSort={setSort}
        />
      </Grid>

      <Grid item xs={10}>
        <Stars stars={stars} hidden={hidden} sortMethod={getStarSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type StarsProps = {
  stars?: Star[]
  hidden: Hidden
  sortMethod: SortMethodStar
}
const Stars = ({ stars = [], hidden, sortMethod }: StarsProps) => {
  const visible = getVisible(mergeSort(stars, sortMethod), hidden)

  return (
    <div id={styles.stars}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{stars.length}</span> Stars
      </Typography>

      {stars.length > 0 ? (
        <VGrid itemHeight={309} total={visible.length} renderData={idx => <StarCard star={visible[idx]} />} />
      ) : (
        <Spinner />
      )}
    </div>
  )
}

type StarCardProps = {
  star?: Star
}
const StarCard = ({ star }: StarCardProps) => {
  if (star === undefined) return null

  return (
    <Link href={{ pathname: '/star/[id]', query: { id: star.id } }}>
      <RibbonContainer component={Card} className={styles.star}>
        <Badge content={star.videoCount}>
          <CardActionArea>
            <ImageCard
              src={`${serverConfig.api}/star/${star.id}/image`}
              width={200}
              height={275}
              missing={star.image === null}
              scale={5}
              alt='star'
            />

            <Typography className='text-center'>{star.name}</Typography>

            <Ribbon label={daysToYears(star.age)} />
          </CardActionArea>
        </Badge>
      </RibbonContainer>
    </Link>
  )
}

type SidebarProps = {
  starData: StarData
  setHidden: SetState<Hidden>
  hidden: Hidden
  setSort: SetState<StarSort>
}
const Sidebar = ({ starData, setHidden, hidden, setSort }: SidebarProps) => (
  <>
    <TitleSearch setHidden={setHidden} />
    <Sort setSort={setSort} />
    <Filter starData={starData} setHidden={setHidden} hidden={hidden} />
  </>
)

type FilterProps = {
  starData: StarData
  setHidden: SetState<Hidden>
  hidden: Hidden
}
const Filter = ({ starData, setHidden, hidden }: FilterProps) => {
  const breast = (target: string) => {
    setHidden(prev => ({ ...prev, breast: target.toLowerCase() }))
  }

  const haircolor = (target: string) => {
    setHidden(prev => ({ ...prev, haircolor: target.toLowerCase() }))
  }

  const ethnicity = (target: string) => {
    setHidden(prev => ({ ...prev, ethnicity: target.toLowerCase() }))
  }

  const website_DROP = (e: SelectChangeEvent) => {
    const targetLower = e.target.value.toLowerCase()

    if (targetLower === 'all') {
      setHidden(prev => ({ ...prev, website: '' }))
    } else {
      setHidden(prev => ({ ...prev, website: targetLower }))
    }
  }

  const breast_NULL = () => {
    setHidden(prev => ({ ...prev, breast: null }))
  }

  const breast_ALL = () => {
    setHidden(prev => ({ ...prev, breast: '' }))
  }

  const haircolor_ALL = () => {
    setHidden(prev => ({ ...prev, haircolor: '' }))
  }

  const ethnicity_ALL = () => {
    setHidden(prev => ({ ...prev, ethnicity: '' }))
  }

  return (
    <>
      <FilterDropdown data={starData.websites} label='website' callback={website_DROP} />

      <FilterItem
        hidden={hidden}
        data={starData.breasts}
        label='breast'
        callback={breast}
        globalCallback={breast_ALL}
        nullCallback={breast_NULL}
      />

      <FilterItem
        hidden={hidden}
        data={starData.haircolors}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
      />

      <FilterItem
        hidden={hidden}
        data={starData.ethnicities}
        label='ethnicity'
        callback={ethnicity}
        globalCallback={ethnicity_ALL}
      />
    </>
  )
}

type SortProps = {
  setSort: SetState<StarSort>
}
const Sort = ({ setSort }: SortProps) => {
  const sortDefault = (reverse = false) => setSort({ type: 'alphabetically', reverse })
  const sortAdded = (reverse = false) => setSort({ type: 'added', reverse })
  const sortAge = (reverse = false) => setSort({ type: 'age', reverse })
  const sortVideos = (reverse = false) => setSort({ type: 'videos', reverse })
  const sortScore = (reverse = false) => setSort({ type: 'score', reverse })

  return (
    <>
      <h2>Sort</h2>

      <FormControl>
        <RadioGroup name='sort' defaultValue='alphabetically'>
          <SortObj id='alphabetically' label={{ asc: 'A-Z', desc: 'Z-A' }} callback={sortDefault} />
          <SortObj id='added' label={{ asc: 'Old Upload', desc: 'Recent Upload' }} callback={sortAdded} reversed />
          <SortObj id='star-age' label={{ asc: 'Teen', desc: 'Milf' }} callback={sortAge} />
          <SortObj id='videos' label={{ asc: 'Least Videos', desc: 'Most Videos' }} callback={sortVideos} reversed />
          <SortObj id='score' label={{ asc: 'Lowest Score', desc: 'Highest Score' }} callback={sortScore} reversed />
        </RadioGroup>
      </FormControl>
    </>
  )
}

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

type FilterItemProps<T = Star> = {
  data?: string[]
  label: keyof T
  callback: (label: string) => void
  globalCallback?: () => void
  nullCallback?: () => void
  hidden: Hidden
}
const FilterItem = ({ data, label, callback, globalCallback, nullCallback }: FilterItemProps) => {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <RadioGroup name={label} defaultValue='ALL'>
          {globalCallback !== undefined && (
            <FormControlLabel
              value='ALL'
              label={<div className={styles.global}>ALL</div>}
              onChange={globalCallback}
              control={<Radio />}
            />
          )}

          {nullCallback !== undefined && (
            <FormControlLabel
              value='NULL'
              label={<div className={styles.global}>NULL</div>}
              onChange={nullCallback}
              control={<Radio />}
            />
          )}

          {data.map(item => (
            <FormControlLabel
              key={item}
              value={item}
              onChange={() => callback(item)}
              label={item}
              control={<Radio />}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterDropdownProps = {
  data?: StarData['websites']
  label: string
  callback: (e: SelectChangeEvent) => void
}
const FilterDropdown = ({ data, label, callback }: FilterDropdownProps) => {
  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <Select variant='standard' id={label} defaultValue='ALL' onChange={callback}>
          <MenuItem value='ALL'>All</MenuItem>
          {data.map(item => (
            <MenuItem key={item.name} value={item.name}>
              {item.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}

export default StarSearchPage
