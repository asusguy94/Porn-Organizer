import { Card, CardActionArea, CardMedia, Typography } from '@mui/material'

import { Link } from '@tanstack/react-router'

import Badge from '@/components/badge'
import MissingImage from '@/components/image/missing'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import { isDefault } from '@/components/search/filter'
import { defaultStarObj as defaultObj, getStarSort as getSort } from '@/components/search/sort'
import Spinner from '@/components/spinner'
import VGrid from '@/components/virtualized/virtuoso'

import { serverConfig } from '@/config'
import { useAllSearchParams } from '@/hooks/search'
import { StarSearch as Star } from '@/interface'
import { searchService } from '@/service'
import { daysToYears } from '@/utils'

import styles from './search.module.scss'

export default function Stars() {
  const { breast, haircolor, query, sort, website } = useAllSearchParams(defaultObj)
  const { data: stars, isLoading } = searchService.useStars()

  if (isLoading || stars === undefined) return <Spinner />

  const visible = stars
    .sort(getSort(sort))
    .filter(s => s.name.toLowerCase().includes(query.toLowerCase()) || isDefault(query, defaultObj.query))
    .filter(
      s => s.breast === breast || (s.breast === null && breast === 'NULL') || isDefault(breast, defaultObj.breast)
    )
    .filter(s => s.haircolor.includes(haircolor) || isDefault(haircolor, defaultObj.haircolor))
    .filter(s => s.websites.includes(website) || isDefault(website, defaultObj.website))

  return (
    <div id={styles.stars}>
      <Typography variant='h6' className='text-center'>
        <span id={styles.count}>{visible.length}</span> Stars
      </Typography>

      <VGrid itemHeight={309} total={visible.length} renderData={idx => <StarCard star={visible.at(idx)} />} />
    </div>
  )
}

type StarCardProps = {
  star?: Star
}
function StarCard({ star }: StarCardProps) {
  if (star === undefined) return null

  return (
    <Link to='/star/$starId' params={{ starId: star.id }}>
      <RibbonContainer component={Card} className={styles.star}>
        <Badge content={star.videoCount}>
          <CardActionArea>
            <CardMedia style={{ height: 275, textAlign: 'center' }}>
              {star.image === null ? (
                <MissingImage renderStyle='height' scale={5} />
              ) : (
                <img
                  src={`${serverConfig.newApi}/star/${star.id}/image`}
                  style={{ width: '100%', height: '100%' }}
                  alt='star'
                />
              )}
            </CardMedia>

            <Typography className='text-center'>{star.name}</Typography>

            <Ribbon label={daysToYears(star.age)} />
          </CardActionArea>
        </Badge>
      </RibbonContainer>
    </Link>
  )
}
