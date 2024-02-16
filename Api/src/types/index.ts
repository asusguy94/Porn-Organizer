export type Params<T extends string | string[]> = {
  params: Record<T extends string ? T : T[number], string>
}

export type VideoStar = {
  id: number
  name: string
  image: string | null
  ageInVideo: number
  numVideos: number
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

export type File = {
  path: string
  website: string
  site: string
  title: string
  date: string
}
