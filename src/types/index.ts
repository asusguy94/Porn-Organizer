import { Website } from '@prisma/client'

// Common types
export type SetState<T> = React.Dispatch<React.SetStateAction<T>>
export type ServerAction = (data: FormData) => Promise<void>

export type General = {
  id: number
  name: string
}

export type Params<T extends string | string[]> = {
  params: Record<T extends string ? T : T[number], string>
}

// Other Types
export type WebsiteWithSites = {
  id: number
  name: string
  sites: General[]
  videos: number
}

export type WebsiteWithCount = Website & { _count: { videos: number } }

export type Bookmark = {
  id: number
  category: {
    id: number
    name: string
  }
  start: number
}

export type Similar = {
  id: number
  name: string
  image: string | null
  match: number
}

export type Video = {
  id: number
  name: string
  validated: boolean
  image: string | null
  slug: string | null
  duration: number
  height?: number
  plays: number
  star: string
  website: string
  subsite: string
  locations: General[]
  attributes: General[]
  date: { added: string; published: string; apiDate: string | null }
  path: { file: string; stream: string }
}

export type VideoStar = {
  id: number
  name: string
  image: string | null
  ageInVideo: number
  numVideos: number
}

export type StarVideo = {
  id: number
  name: string
  image: string
  date: string
  fname: string
  website: string
  site: string | null
  age: number
  hidden: boolean
}

export type LocalWebsite = {
  label: string
  count: number
  finished: boolean
}

export type Gender = 'Female' | 'Male' | null

export type Extra = {
  birthday: string | null
  ethnicity: string | null
  nationality: string | null
  weight: string | null
  height: string | null
  cupsize: string | null
}

export type Performer = {
  id: string
  name: string
  extra: Extra & {
    gender: Gender
    haircolor: string | null
  }
  image: string
  thumbnail: string
}