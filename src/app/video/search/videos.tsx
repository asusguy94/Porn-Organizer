import { useState, useEffect } from 'react'

import { Card, CardActionArea, Grid, Typography } from '@mui/material'

import { useReadLocalStorage } from 'usehooks-ts'

import { ImageCard } from '@components/image'
import Link from '@components/link'
import Ribbon, { RibbonContainer } from '@components/ribbon'
import { getVisible, HiddenVideo as Hidden, VideoSearch as Video } from '@components/search/helper'
import { getVideoSort, SortMethodVideo } from '@components/search/sort'
import Spinner from '@components/spinner'
import VGrid from '@components/virtualized/virtuoso'

import { serverConfig } from '@config'
import { LocalWebsite } from '@interfaces'
import { searchService } from '@service'
import { daysToYears } from '@utils/client/date-time'

import styles from './search.module.scss'

type VideosProps = {
  hidden: Hidden
  sortMethod: SortMethodVideo
}
const Videos = ({ hidden, sortMethod }: VideosProps) => {
  const localWebsites = useReadLocalStorage<LocalWebsite[]>('websites')
  const [filtered, setFiltered] = useState<Video[]>([])
  const [data, setData] = useState<{ label: string; count: number }[]>([])

  const { data: videos } = searchService.useVideos()

  useEffect(() => {
    if (videos === undefined) return

    const map = new Map<string, number>()

    const initialData = (localWebsites !== null ? [...localWebsites] : []).map(wsite => ({
      ...wsite,
      count: wsite.finished ? wsite.count + 1 : wsite.count
    }))

    let stop = false
    setFiltered(
      videos
        // .filter(video => !video.attributes.includes(excludedAttribute)) //FIXME broken file/stream?
        .sort(getVideoSort({ type: 'date' }))
        .filter(video => {
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
  }, [localWebsites, videos, hidden])

  if (videos === undefined) return <Spinner />

  const visible = getVisible(filtered.sort(sortMethod), hidden)

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

      <VGrid itemHeight={300} total={visible.length} renderData={idx => <VideoCard video={visible[idx]} />} />
    </div>
  )
}

type VideoCardProps = {
  video?: Video
}
const VideoCard = ({ video }: VideoCardProps) => {
  if (video === undefined) return null

  return (
    <Link href={`/video/${video.id}`}>
      <RibbonContainer component={Card} className={styles.video}>
        <CardActionArea>
          <ImageCard
            src={`${serverConfig.api}/video/${video.id}/image`}
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

export default Videos
