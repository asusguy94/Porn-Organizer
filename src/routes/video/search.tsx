import { FormControl, Grid, RadioGroup, SelectChangeEvent, TextField } from '@mui/material'

import { createFileRoute } from '@tanstack/react-router'
import ScrollToTop from 'react-scroll-to-top'

import { RegularHandlerProps } from '@/components/indeterminate'
import { FilterCheckbox, FilterDropdown, isDefault } from '@/components/search/filter'
import { SortObjVideo as SortObj, defaultVideoObj as defaultObj, getSortString } from '@/components/search/sort'
import Spinner from '@/components/spinner'

import Videos from './-videos'

import { useAllSearchParams, useDynamicSearchParam, useSearchParam } from '@/hooks/search'
import useFocus from '@/hooks/useFocus'
import { General } from '@/interface'
import { attributeService, categoryService, locationService, websiteService } from '@/service'

import styles from './search.module.scss'

export const Route = createFileRoute('/video/search')({
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
