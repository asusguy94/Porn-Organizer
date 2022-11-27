// Common types
export type ISetState<T> = React.Dispatch<React.SetStateAction<T>>
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type PickOptional<T, K extends PropertyKey> = Pick<T, Extract<keyof T, K>>
export type IndexType<V = any> = Record<string, V>
export type Nullable<T> = T | null

// Common interface
export interface IGeneral {
  id: number
  name: string
}

// Other Types
export type IQuality = 1080 | 720 | 480 | 360 | 0

// Other Interfaces
export interface IWebsiteWithSites {
  id: number
  name: string
  sites: IGeneral[]
}

export interface IBookmark {
  id: number
  category: {
    id: number
    name: string
  }
  start: number
}

export interface ISimilar {
  id: number
  name: string
  image: string | null
  match: number
}

export interface IVideo {
  id: number
  name: string
  image: string | null
  slug: string | null
  duration: number
  height?: number
  plays: number
  star: string
  website: string
  subsite: string
  locations: IGeneral[]
  attributes: IGeneral[]
  date: { added: string; published?: string; invalid: boolean }
  path: { file: string; stream: string }
}

export interface IVideoStar {
  id: number
  name: string
  image: string | null
  ageInVideo: number
  numVideos: number
}

export interface IStarVideo {
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

export interface ILocalWebsite {
  label: string
  count: number
  finished: boolean
}
