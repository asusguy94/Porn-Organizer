'use client'

import { useEffect, useRef } from 'react'

import { Grid, TextField, FormControl, RadioGroup, SelectChangeEvent } from '@mui/material'

import ScrollToTop from 'react-scroll-to-top'

import { FilterDropdown, FilterRadio, isDefault } from '@components/search/filter'
import { SortObjStar as SortObj, defaultStarObj as defaultObj, getSortString } from '@components/search/sort'

import Stars from './stars'

import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@hooks/search'
import { Website } from '@prisma/client'

import styles from './search.module.scss'

type StarInfo = {
  breast: string[]
  haircolor: string[]
  ethnicity: string[]
}

type StarSearchPageProps = {
  websites: Website[]
  starInfo: StarInfo
}
function StarSearchPage({ websites, starInfo }: StarSearchPageProps) {
  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar starData={starInfo} websites={websites} />
      </Grid>

      <Grid item xs={10}>
        <Stars />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type SidebarProps = {
  starData: StarInfo
  websites: Website[]
}
const Sidebar = ({ starData, websites }: SidebarProps) => (
  <>
    <TitleSearch />
    <Sort />
    <Filter starData={starData} websites={websites} />
  </>
)

type FilterProps = {
  starData: StarInfo
  websites: Website[]
}
function Filter({ starData, websites }: FilterProps) {
  const { setParam, update } = useDynamicSearchParam(defaultObj)

  const breast = (target: string) => {
    if (isDefault(target, defaultObj.breast)) {
      setParam('breast', defaultObj.breast)
    } else {
      setParam('breast', target)
    }
    update()
  }

  const haircolor = (target: string) => {
    if (isDefault(target, defaultObj.haircolor)) {
      setParam('haircolor', defaultObj.haircolor)
    } else {
      setParam('haircolor', target)
    }
    update()
  }

  const ethnicity = (target: string) => {
    if (isDefault(target, defaultObj.ethnicity)) {
      setParam('ethnicity', defaultObj.ethnicity)
    } else {
      setParam('ethnicity', target)
    }
    update()
  }

  const website_DROP = (e: SelectChangeEvent) => {
    const value = e.target.value

    setParam('website', value)
    update()
  }

  const breast_NULL = () => {
    setParam('breast', 'NULL')
    update()
  }

  const breast_ALL = () => {
    setParam('breast', defaultObj.breast)
    update()
  }

  const haircolor_ALL = () => {
    setParam('haircolor', defaultObj.haircolor)
    update()
  }

  const ethnicity_ALL = () => {
    setParam('ethnicity', defaultObj.ethnicity)
    update()
  }

  return (
    <>
      <FilterDropdown data={websites} label='website' callback={website_DROP} defaultObj={defaultObj} />

      <FilterRadio
        data={starData.breast}
        label='breast'
        callback={breast}
        nullCallback={breast_NULL}
        globalCallback={breast_ALL}
        defaultObj={defaultObj}
      />

      <FilterRadio
        data={starData.haircolor}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
        defaultObj={defaultObj}
      />

      <FilterRadio
        data={starData.ethnicity}
        label='ethnicity'
        callback={ethnicity}
        globalCallback={ethnicity_ALL}
        defaultObj={defaultObj}
      />
    </>
  )
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

  const sortAge = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-age')
    } else {
      setParam('sort', 'age')
    }
    update()
  }

  const sortVideos = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-videos')
    } else {
      setParam('sort', 'videos')
    }
    update()
  }

  const sortScore = (reverse = false) => {
    if (reverse) {
      setParam('sort', '-score')
    } else {
      setParam('sort', 'score')
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
          <SortObj id='age' labels={['Teen', 'Milf']} callback={sortAge} />
          <SortObj id='videos' labels={['Most Videos', 'Least Videos']} callback={sortVideos} reversed />
          <SortObj id='score' labels={['Highest Score', 'Lowest Score']} callback={sortScore} reversed />
        </RadioGroup>
      </FormControl>
    </>
  )
}

function TitleSearch() {
  const { setParam, update } = useDynamicSearchParam(defaultObj)
  const { currentValue } = useSearchParam(defaultObj, 'query')

  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (ref.current !== null) {
      ref.current.value = currentValue
      ref.current.focus()
    }
  }, [currentValue])

  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    setParam('query', e.currentTarget.value)
    update()
  }

  return <TextField inputRef={ref} variant='standard' placeholder='Name' onChange={callback} />
}

export default StarSearchPage
