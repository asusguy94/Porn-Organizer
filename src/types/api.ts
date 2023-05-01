import { Star as RawStar, Video as RawVideo } from '@prisma/client'

export type HomeVideo = {
  id: number
  name: string
  image: string | null
  total?: number
}

export type StarImage = {
  image: string
}

export type StarImages = {
  images: string[]
}

export type SimilarStar = {
  id: number
  name: string
  image: string | null
  match: number
}

export type Star = {
  id: number
  name: string
  image: string | null
  ignored: boolean
  info: {
    breast: string
    haircolor: string
    ethnicity: string
    birthdate: string
    height: string
    weight: string
  }
  similar: SimilarStar[]
}

export type PutStar = {
  reload: boolean
  content: string | number | Date | null
  similar: SimilarStar[]
}

export type VideoStar = {
  id: number
  name: string
  date: Date
  fname: string
  website: string
  site: string | null
  age: number
}

export type FixVideoDate = RawVideo & {
  star: RawStar | null
  age: number
}

export type BroadSceneSlug = {
  id: string
  title: string
  image: string
  site: string
  date: string
}

type Gender = 'Female' | 'Male' | null

type Extra = {
  birthday: string | null
  ethnicity: string | null
  nationality: string | null
  weight: string | null
  height: string | null
  cupsize: string | null
}

type Performer = {
  id: string
  name: string
  extra: Extra & {
    gender: Gender
    haircolor: string | null
  }
  image: string
  thumbnail: string
}

export type SceneData = {
  id: string
  title: string
  date: string
  image: string
  background: {
    full: string
    large: string
    medium: string
    small: string
  }
  performers: Performer[]
}

export type { RawStar }
export type { Attribute, Category, Location } from '@prisma/client'
