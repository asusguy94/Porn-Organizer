import { FormControlLabel, Radio } from '@mui/material'
import { StarSearch as Star, VideoSearch as Video } from './helper'

type SortObjProps = {
  label: {
    asc: string
    desc: string
  }
  id: string
  callback: (reversed: boolean) => void
  reversed?: boolean
}
const SortObj = ({ id, label, callback, reversed = false }: SortObjProps) => (
  <>
    <FormControlLabel
      label={reversed ? label.desc : label.asc}
      value={id}
      control={<Radio />}
      onChange={() => callback(reversed)}
    />
    <FormControlLabel
      label={reversed ? label.asc : label.desc}
      value={`${id}_reverse`}
      control={<Radio />}
      onChange={() => callback(!reversed)}
    />
  </>
)

type Sort<T extends string> = { type: T; reverse: boolean }

export type SortTypeVideo = Sort<'alphabetically' | 'added' | 'date' | 'age' | 'plays' | 'title-length'>
export type SortTypeStar = Sort<'alphabetically' | 'added' | 'age' | 'videos' | 'score'>
export type SortMethodVideo = (a: Video, b: Video) => number
export type SortMethodStar = (a: Star, b: Star) => number

export function getVideoSort(sort: SortTypeVideo): SortMethodVideo {
  let sortMethod: SortMethodVideo

  switch (sort.type) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
      break
    case 'date':
      sortMethod = (a, b) => {
        if (a.date === null && b.date === null) return 0
        if (a.date === null) return 1
        if (b.date === null) return -1

        return new Date(a.date).getTime() - new Date(b.date).getTime()
      }
      break
    case 'age':
      sortMethod = (a, b) => a.ageInVideo - b.ageInVideo
      break
    case 'plays':
      sortMethod = (a, b) => a.plays - b.plays
      break
    case 'title-length':
      sortMethod = (a, b) => a.name.length - b.name.length
      break
    default:
      sortMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
  }

  return sort.reverse ? (a, b) => sortMethod(b, a) : sortMethod
}

export function getStarSort(sort: SortTypeStar): SortMethodStar {
  let sortMethod: SortMethodStar

  switch (sort.type) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
      break
    case 'age':
      sortMethod = (a, b) => a.age - b.age
      break
    case 'videos':
      sortMethod = (a, b) => a.videoCount - b.videoCount
      break
    case 'score':
      sortMethod = (a, b) => {
        return calculateScore(a.websites.length, a.videoCount) - calculateScore(b.websites.length, b.videoCount)
      }
      break
    default:
      sortMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
  }

  return sort.reverse ? (a, b) => sortMethod(b, a) : sortMethod
}

const calculateScore = (websites: number, videos: number) => {
  const multiplier = 5

  return videos + (websites > 1 ? websites * multiplier : websites)
}

export default SortObj
