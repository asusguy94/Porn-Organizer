'use client'

import { NextPage } from 'next/types'
import { useState } from 'react'

import { FormControl, Grid, RadioGroup, SelectChangeEvent, TextField } from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'

import { RegularHandlerProps } from '@components/indeterminate'
import { FilterDropdown, FilterObj } from '@components/search/filter'
import { HiddenVideo as Hidden } from '@components/search/helper'
import SortObj, { getVideoSort, SortTypeVideo as VideoSort } from '@components/search/sort'

import Videos from './videos'

import { SetState, General } from '@interfaces'

import styles from './search.module.scss'

const VideoSearchPage: NextPage<{
  attributes: General[]
  categories: General[]
  locations: General[]
  websites: General[]
}> = ({ attributes, categories, locations, websites }) => {
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

export default VideoSearchPage
