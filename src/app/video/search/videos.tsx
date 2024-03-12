import { useState, useEffect } from 'react'

import { Card, CardActionArea, Grid, Typography } from '@mui/material'

import { useReadLocalStorage } from 'usehooks-ts'

import { ImageCard } from '@/components/image'
import Link from '@/components/link'
import Ribbon, { RibbonContainer } from '@/components/ribbon'
import { isDefault } from '@/components/search/filter'
import { defaultVideoObj as defaultObj, getVideoSort as getSort } from '@/components/search/sort'
import Spinner from '@/components/spinner'
import VGrid from '@/components/virtualized/virtuoso'

import { serverConfig } from '@/config'
import { useAllSearchParams } from '@/hooks/search'
import { LocalWebsite, VideoSearch } from '@/interface'
import { searchService } from '@/service'
import { daysToYears } from '@/utils/client/date-time'

import styles from './search.module.scss'

export default function Videos() {
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
    <Link href={`/video/${video.id}`}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <ImageCard
            src={`${serverConfig.newApi}/video/${video.id}/image`}
            width={290}
            height={170}
            missing={video.image === null}
            scale={5}
            alt='video'
          />

          <Grid container justifyContent='center' className={styles.title}>
            <Typography className='text-center'>{video.name}</Typography>
          </Grid>

          <Ribbon label={daysToYears(video.ageInVideo)} />
        </CardActionArea>
      </RibbonContainer>
    </Link>
  )
}
