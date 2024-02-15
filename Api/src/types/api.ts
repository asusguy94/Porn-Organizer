export type SimilarStar = {
  id: number
  name: string
  image: string | null
  match: number
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
  performers: {
    id: string
    name: string
    extra: {
      birthday: string | null
      ethnicity: string | null
      nationality: string | null
      weight: string | null
      height: string | null
      cupsize: string | null
      gender: 'Female' | 'Male' | null
      haircolor: string | null
    }
    image: string
    thumbnail: string
  }[]
}
