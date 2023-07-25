import { Card, CardActionArea, Typography } from '@mui/material'

import Badge from '@components/badge'
import { ImageCard } from '@components/image'
import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import { getVisible, HiddenStar as Hidden, StarSearch as Star } from '@components/search/helper'
import { SortMethodStar } from '@components/search/sort'
import Spinner from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'

import { serverConfig } from '@config'
import { searchService } from '@service'
import { daysToYears } from '@utils/client/date-time'

import styles from './search.module.scss'

type StarsProps = {
  hidden: Hidden
  sortMethod: SortMethodStar
}
const Stars = ({ hidden, sortMethod }: StarsProps) => {
  const { data: stars } = searchService.useStars()

  if (stars === undefined) return <Spinner />

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
    <Link href={`/star/${star.id}`}>
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

export default Stars
