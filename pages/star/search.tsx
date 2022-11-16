import { NextPage } from 'next/types'
import React, { useState, useEffect, useRef } from 'react'

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

import { ImageCard } from '@components/image'
import LabelCount from '@components/labelcount'
import { getVisible } from '@components/search/helper'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Badge from '@components/badge'
import Loader from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'
import Link from '@components/link'
import SortObj from '@components/search/sort'

import { IGeneral, ISetState } from '@interfaces'
import { searchApi, starApi, websiteApi } from '@api'
import { serverConfig } from '@config'

import styles from './search.module.scss'

interface IStar {
  id: number
  name: string
  image: string | null
  age: number
  breast: string | null
  ethnicity: string | null
  haircolor: string | null
  websites: string[]
  sites: string[]
  videoCount: number
  hidden: {
    titleSearch: boolean
    breast: boolean
    haircolor: boolean
    ethnicity: boolean
    website: boolean
    noBreast: boolean
  }
  score: number
}

interface IStarData {
  breasts: string[]
  haircolors: string[]
  ethnicities: string[]
  websites: IGeneral[]
}

const StarSearchPage: NextPage = () => {
  const [stars, setStars] = useState<IStar[]>([])
  const [breasts, setBreasts] = useState<string[]>([])
  const [haircolors, setHaircolors] = useState<string[]>([])
  const [ethnicities, setEthnicities] = useState<string[]>([])
  const [websites, setWebsites] = useState<IGeneral[]>([])

  const inputRef = useRef<HTMLInputElement>(null)

  const calculateScore = (websites: number, videos: number) => {
    const multiplier = 5

    return videos + (websites > 1 ? websites * multiplier : websites)
  }

  useEffect(() => {
    searchApi.getStars<IStar>().then(({ data }) => {
      setStars(
        data.map(star => ({
          ...star,
          score: calculateScore(star.websites.length, star.videoCount),
          hidden: {
            titleSearch: false,

            breast: false,
            haircolor: false,
            ethnicity: false,
            website: false,

            noBreast: false
          }
        }))
      )
    })

    websiteApi.getAll().then(({ data }) => setWebsites(data))
    starApi.getInfo().then(({ data }) => {
      setBreasts(data.breast)
      setHaircolors(data.haircolor)
      setEthnicities(data.ethnicity)
    })
  }, [])

  return (
    <Grid container>
      <Grid item xs={2} id={styles.sidebar}>
        <Sidebar
          starData={{ breasts, haircolors, ethnicities, websites }}
          stars={stars}
          update={setStars}
          inputRef={inputRef}
        />
      </Grid>

      <Grid item xs={10}>
        <Stars stars={stars} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

interface StarsProps {
  stars: IStar[]
}
const Stars = ({ stars }: StarsProps) => {
  const visibleStars = getVisible(stars)

  return (
    <div id={styles.stars}>
      {stars.length ? (
        <>
          <Typography variant='h6' className='text-center'>
            <span className={styles.count}>{visibleStars.length}</span> Stars
          </Typography>

          <VGrid
            itemHeight={309}
            total={visibleStars.length}
            renderData={idx => <StarCard star={visibleStars[idx]} />}
          />
        </>
      ) : (
        <Loader />
      )}
    </div>
  )
}

interface StarCardProps {
  star?: IStar
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

interface SidebarProps {
  starData: IStarData
  stars: IStar[]
  update: ISetState<IStar[]>
  inputRef: React.Ref<HTMLInputElement>
}
const Sidebar = ({ starData, stars, update, inputRef }: SidebarProps) => (
  <>
    <TitleSearch stars={stars} update={update} inputRef={inputRef} />

    <Sort stars={stars} update={update} />

    <Filter starData={starData} stars={stars} update={update} />
  </>
)

interface FilterProps {
  stars: IStar[]
  starData: IStarData
  update: ISetState<IStar[]>
}
const Filter = ({ stars, starData, update }: FilterProps) => {
  const breast = (target: string) => {
    stars = stars.map(star => {
      star.hidden.noBreast = false
      star.hidden.breast = star.breast === null || star.breast.toLowerCase() !== target.toLowerCase()

      return star
    })

    update(stars)
  }

  const haircolor = (target: string) => {
    stars = stars.map(star => {
      console.log(star.haircolor)

      star.hidden.haircolor = star.haircolor === null || star.haircolor.toLowerCase() !== target.toLowerCase()

      return star
    })

    update(stars)
  }

  const ethnicity = (target: string) => {
    stars = stars.map(star => {
      star.hidden.ethnicity = star.ethnicity === null || star.ethnicity.toLowerCase() !== target.toLowerCase()

      return star
    })

    update(stars)
  }

  const website_DROP = (e: SelectChangeEvent) => {
    const targetLower = e.target.value.toLowerCase()

    update(
      [...stars].map(star => {
        if (targetLower === 'all') {
          return { ...star, hidden: { ...star.hidden, website: false } }
        } else {
          return {
            ...star,
            hidden: {
              ...star.hidden,
              website: !star.websites.some(website => website.toLowerCase() === targetLower)
            }
          }
        }
      })
    )
  }

  const breast_NULL = (e: React.ChangeEvent<HTMLFormElement>) => {
    stars = stars.map(star => {
      star.hidden.noBreast = e.currentTarget.checked && star.breast !== null
      star.hidden.breast = false

      return star
    })

    update(stars)
  }

  const breast_ALL = () => {
    stars = stars.map(star => {
      star.hidden.breast = false
      star.hidden.noBreast = false

      return star
    })

    update(stars)
  }

  const haircolor_ALL = () => {
    stars = stars.map(star => {
      star.hidden.haircolor = false

      return star
    })

    update(stars)
  }

  const ethnicity_ALL = () => {
    stars = stars.map(star => {
      star.hidden.ethnicity = false

      return star
    })

    update(stars)
  }

  return (
    <>
      <FilterDropdown data={starData.websites} label='website' callback={website_DROP} />

      <FilterItem
        data={starData.breasts}
        obj={stars}
        label='breast'
        callback={breast}
        globalCallback={breast_ALL}
        nullCallback={breast_NULL}
      />

      <FilterItem
        data={starData.haircolors}
        obj={stars}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
      />

      <FilterItem
        data={starData.ethnicities}
        obj={stars}
        label='ethnicity'
        callback={ethnicity}
        globalCallback={ethnicity_ALL}
      />
    </>
  )
}

interface SortProps {
  stars: IStar[]
  update: ISetState<IStar[]>
}
const Sort = ({ stars, update }: SortProps) => {
  const sortDefault = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
        return reverse ? result * -1 : result
      })
    )
  }

  const sortAdded = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.id - b.id
        return reverse ? result * -1 : result
      })
    )
  }

  const sortAge = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.age - b.age
        return reverse ? result * -1 : result
      })
    )
  }

  const sortVideos = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.videoCount - b.videoCount
        return reverse ? result * -1 : result
      })
    )
  }

  const sortScore = (reverse = false) => {
    update(
      [...stars].sort((a, b) => {
        const result = a.score - b.score
        return reverse ? result * -1 : result
      })
    )
  }

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

interface TitleSearchProps {
  stars: IStar[]
  update: ISetState<IStar[]>
  inputRef: React.Ref<HTMLInputElement>
}
const TitleSearch = ({ stars, update, inputRef }: TitleSearchProps) => {
  const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchValue = e.currentTarget.value.toLowerCase()

    update(
      stars.map(star => ({
        ...star,
        hidden: {
          ...star.hidden,
          titleSearch: !star.name.toLowerCase().includes(searchValue)
        }
      }))
    )
  }

  return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} inputRef={inputRef} />
}

interface FilterItemProps {
  data: string[]
  label: string
  obj: IStar[]
  callback: any
  globalCallback?: () => void
  nullCallback?: any
}
const FilterItem = ({ data, label, obj, callback, globalCallback, nullCallback }: FilterItemProps) => (
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
            label={
              <>
                {item} <LabelCount prop={label} label={item} obj={obj} isArr />
              </>
            }
            control={<Radio />}
          />
        ))}
      </RadioGroup>
    </FormControl>
  </>
)

interface FilterDropdownProps {
  data: IStarData['websites']
  label: string
  callback: (e: SelectChangeEvent) => void
}
const FilterDropdown = ({ data, label, callback }: FilterDropdownProps) => (
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

export default StarSearchPage
