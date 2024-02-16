import { FormControlLabel, Radio } from '@mui/material'

import { AllowString, StarSearch, VideoSearch } from '@/types'

const reverseChar = '-'
function createReverse<T extends string>(sort: T) {
  return `${reverseChar}${sort}` as const
}

type SortObjProps<T extends DefaultObj> = {
  labels: [string, string]
  id: T['sort']
  callback: (reversed: boolean) => void
  reversed?: boolean
}
function SortObj<T extends DefaultObj>({ id, labels, callback, reversed = false }: SortObjProps<T>) {
  return (
    <>
      <FormControlLabel
        label={labels[0]}
        value={getSortString(reversed ? createReverse(id) : id)}
        control={<Radio />}
        onChange={() => callback(reversed)}
      />
      <FormControlLabel
        label={labels[1]}
        value={getSortString(!reversed ? createReverse(id) : id)}
        control={<Radio />}
        onChange={() => callback(!reversed)}
      />
    </>
  )
}

export function getSortString(sort: string, reverseSort = isReverseSort(sort)) {
  return reverseSort ? createReverse(sort) : sort
}

function isReverseSort(sort: string) {
  return sort.startsWith(reverseChar)
}

function getBaseSort<T extends string>(sort: T) {
  return sort.replace(new RegExp(`^${reverseChar}`), '') as WithoutReverse<T>
}

export function SortObjVideo(params: SortObjProps<DefaultVideoObj>) {
  return <SortObj {...params} />
}

export function SortObjStar(params: SortObjProps<DefaultStarObj>) {
  return <SortObj {...params} />
}

type SortMethod<T> = (a: T, b: T) => number
export type SortMethodVideo = SortMethod<VideoSearch>
export type SortMethodStar = SortMethod<StarSearch>

type WithReverse<T extends string> = T | ReturnType<typeof createReverse<T>>
type WithoutReverse<T extends string> = T extends ReturnType<typeof createReverse<infer U extends string>> ? U : T

type DefaultVideoObj = {
  category: string
  nullCategory: '0' | '1'
  attribute: string
  location: string
  website: string
  query: string
  sort: WithReverse<'alphabetical' | 'added' | 'date' | 'age' | 'plays' | 'title-length'>
}

type DefaultStarObj = {
  breast: AllowString<'NULL'>
  haircolor: string
  ethnicity: string
  website: string
  query: string
  sort: WithReverse<'alphabetical' | 'added' | 'age' | 'videos' | 'score'>
}

export const defaultVideoObj: DefaultVideoObj = {
  category: '',
  nullCategory: '0',
  attribute: '',
  location: '',
  website: 'ALL',
  query: '',
  sort: 'date'
}

export const defaultStarObj: DefaultStarObj = {
  breast: '',
  haircolor: '',
  ethnicity: '',
  website: 'ALL',
  query: '',
  sort: 'alphabetical'
}

export type DefaultObj = DefaultVideoObj | DefaultStarObj

export function getVideoSort(type: DefaultVideoObj['sort']): SortMethodVideo {
  let sortMethod: SortMethodVideo

  switch (getBaseSort(type)) {
    case 'added':
      sortMethod = (a, b) => a.id - b.id
      break
    case 'date':
      sortMethod = (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
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
      sortMethod = (a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'case' })
  }

  return isReverseSort(type) ? (a, b) => sortMethod(b, a) : sortMethod
}

export function getStarSort(type: DefaultStarObj['sort']): SortMethodStar {
  let sortMethod: SortMethodStar

  switch (getBaseSort(type)) {
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
      sortMethod = (a, b) => a.score - b.score
      break
    default:
      sortMethod = (a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
  }

  return isReverseSort(type) ? (a, b) => sortMethod(b, a) : sortMethod
}
