'use client'

import { NextPage } from 'next/types'
import { useState } from 'react'

import { Grid, TextField, FormControl, RadioGroup, FormControlLabel, Radio, SelectChangeEvent } from '@mui/material'

import capitalize from 'capitalize'
import ScrollToTop from 'react-scroll-to-top'

import { FilterDropdown } from '@components/search/filter'
import { HiddenStar as Hidden, StarSearch as Star } from '@components/search/helper'
import SortObj, { getStarSort, SortTypeStar as StarSort } from '@components/search/sort'
import Spinner from '@components/spinner'

import Stars from './stars'

import { SetState } from '@interfaces'
import { Website } from '@prisma/client'

import styles from './search.module.scss'

type StarInfo = { breast: string[]; haircolor: string[]; ethnicity: string[] }

const StarSearchPage: NextPage<{ websites: Website[]; starInfo: StarInfo }> = ({ websites, starInfo }) => {
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
        <Sidebar starData={starInfo} websites={websites} setHidden={setHidden} setSort={setSort} />
      </Grid>

      <Grid item xs={10}>
        <Stars hidden={hidden} sortMethod={getStarSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  starData: StarInfo
  websites: Website[]
  setHidden: SetState<Hidden>
  setSort: SetState<StarSort>
}
const Sidebar = ({ starData, websites, setHidden, setSort }: SidebarProps) => (
  <>
    <TitleSearch setHidden={setHidden} />
    <Sort setSort={setSort} />
    <Filter starData={starData} websites={websites} setHidden={setHidden} />
  </>
)

type FilterProps = {
  starData: StarInfo
  websites: Website[]
  setHidden: SetState<Hidden>
}
const Filter = ({ starData, websites, setHidden }: FilterProps) => {
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
      <FilterDropdown data={websites} label='website' callback={website_DROP} />

      <FilterItem
        data={starData.breast}
        label='breast'
        callback={breast}
        globalCallback={breast_ALL}
        nullCallback={breast_NULL}
      />

      <FilterItem data={starData.haircolor} label='haircolor' callback={haircolor} globalCallback={haircolor_ALL} />

      <FilterItem data={starData.ethnicity} label='ethnicity' callback={ethnicity} globalCallback={ethnicity_ALL} />
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

export default StarSearchPage
