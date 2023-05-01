import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'
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

import { ImageCard } from '@components/image'
import { getVisible, HiddenStar as Hidden, StarSearch as Star, StarSearch } from '@components/search/helper'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import Badge from '@components/badge'
import Spinner from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'
import Link from '@components/link'
import SortObj, { getStarSort, SortMethodStar, SortTypeStar as StarSort } from '@components/search/sort'

import { General, SetState } from '@interfaces'
import { serverConfig } from '@config'
import { Site, Website } from '@prisma/client'
import prisma from '@utils/server/prisma'
import { getUnique } from '@utils/shared'
import { dateDiff } from '@utils/server/helper'

import styles from './search.module.scss'

export const getServerSideProps: GetServerSideProps<{
  websites: Website[]
  starInfo: { breast: string[]; haircolor: string[]; ethnicity: string[] }
  stars: StarSearch[]
}> = async () => {
  const websites = await prisma.website.findMany({ orderBy: { name: 'asc' } })

  const breast = await prisma.star.findMany({
    select: { breast: true },
    where: { breast: { not: null } },
    orderBy: { breast: 'asc' }
  })

  const ethnicity = await prisma.star.findMany({
    select: { ethnicity: true },
    where: { ethnicity: { not: null } },
    orderBy: { ethnicity: 'asc' }
  })

  const haircolor = await prisma.star.findMany({
    select: { haircolor: true },
    where: { haircolor: { not: null } },
    orderBy: { haircolor: 'asc' }
  })

  /**
   * Returns a site-activity percentage as a decimal
   * @param website the website to compare with
   * @param sites the sites to check
   * @returns a number between 0 and 1
   */
  const calculateSiteScore = (website: Website & { sites: Site[] }, sites: Site[]): number => {
    return sites.filter(s => s.websiteID === website.id).length / website.sites.length
  }

  // highest siteScore is currently 2.6, or 26 when *10
  const calculateScore = (websitesWithSites: (Website & { sites: Site[] })[], sites: Site[]) => {
    const siteScore = websitesWithSites
      .map(website => calculateSiteScore(website, sites) * 10)
      .filter(score => !isNaN(score))
      .reduce((sum, score) => sum + score, 0)

    return siteScore
  }

  const stars = await prisma.star.findMany({
    orderBy: { name: 'asc' },
    include: { videos: { include: { website: { include: { sites: true } }, site: true } } }
  })

  return {
    props: {
      websites,
      starInfo: {
        breast: getUnique(breast.flatMap(({ breast }) => (breast !== null ? [breast] : []))),
        ethnicity: getUnique(ethnicity.flatMap(({ ethnicity }) => (ethnicity !== null ? [ethnicity] : []))),
        haircolor: getUnique(haircolor.flatMap(({ haircolor }) => (haircolor !== null ? [haircolor] : [])))
      },
      stars: stars.map(star => {
        const websites = getUnique(
          star.videos.map(({ website }) => website),
          'id'
        )
        const sites = getUnique(
          star.videos.flatMap(({ site }) => (site !== null ? [site] : [])),
          'id'
        )

        return {
          id: star.id,
          name: star.name,
          image: star.image,
          breast: star.breast,
          haircolor: star.haircolor,
          ethnicity: star.ethnicity,
          age: dateDiff(star.birthdate),
          videoCount: star.videos.length,
          score: calculateScore(websites, sites),
          websites: websites.map(w => w.name),
          sites: sites.map(s => s.name)
        }
      })
    }
  }
}

const StarSearchPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
  websites,
  starInfo,
  stars
}) => {
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
        <Sidebar starData={starInfo} websites={websites} setHidden={setHidden} hidden={hidden} setSort={setSort} />
      </Grid>

      <Grid item xs={10}>
        <Stars stars={stars} hidden={hidden} sortMethod={getStarSort(sort)} />
      </Grid>

      <ScrollToTop smooth />
    </Grid>
  )
}

type StarsProps = {
  stars: StarSearch[]
  hidden: Hidden
  sortMethod: SortMethodStar
}
const Stars = ({ stars, hidden, sortMethod }: StarsProps) => {
  const visible = getVisible(stars.sort(sortMethod), hidden)

  return (
    <div id={styles.stars}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Stars
      </Typography>

      <VGrid itemHeight={309} total={visible.length} renderData={idx => <StarCard star={visible[idx]} />} />
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
  starData: InferGetServerSidePropsType<typeof getServerSideProps>['starInfo']
  websites: Website[]
  setHidden: SetState<Hidden>
  hidden: Hidden
  setSort: SetState<StarSort>
}
const Sidebar = ({ starData, websites, setHidden, hidden, setSort }: SidebarProps) => (
  <>
    <TitleSearch setHidden={setHidden} />
    <Sort setSort={setSort} />
    <Filter starData={starData} websites={websites} setHidden={setHidden} hidden={hidden} />
  </>
)

type FilterProps = {
  starData: InferGetServerSidePropsType<typeof getServerSideProps>['starInfo']
  websites: Website[]
  setHidden: SetState<Hidden>
  hidden: Hidden
}
const Filter = ({ starData, websites, setHidden, hidden }: FilterProps) => {
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
        hidden={hidden}
        data={starData.breast}
        label='breast'
        callback={breast}
        globalCallback={breast_ALL}
        nullCallback={breast_NULL}
      />

      <FilterItem
        hidden={hidden}
        data={starData.haircolor}
        label='haircolor'
        callback={haircolor}
        globalCallback={haircolor_ALL}
      />

      <FilterItem
        hidden={hidden}
        data={starData.ethnicity}
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
  data?: General[]
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
