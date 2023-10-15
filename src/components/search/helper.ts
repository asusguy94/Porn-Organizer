export type HiddenStar = {
  titleSearch: string
  breast: string | null
  haircolor: string
  ethnicity: string
  website: string
}

export type HiddenVideo = {
  category: (string | null)[]
  attribute: string[]
  location: string[]
  titleSearch: string
  website: string
}

export type StarSearch = {
  id: number
  name: string
  image: string | null
  age: number
  breast: string | null
  ethnicity: string | null
  haircolor: string[]
  score: number
  websites: string[]
  sites: string[]
  videoCount: number
}

export type VideoSearch = {
  id: number
  name: string
  ageInVideo: number
  attributes: string[]
  categories: string[]
  date: string
  image: string | null
  locations: string[]
  plays: number
  quality: number
  site: string | null
  star: string | null
  website: string
  api: string | null
}

type HiddenType = HiddenStar | HiddenVideo
type ObjectType = StarSearch | VideoSearch

const isHiddenVideo = (hidden: HiddenType): hidden is HiddenVideo => 'category' in hidden
const isHiddenStar = (hidden: HiddenType): hidden is HiddenStar => 'breast' in hidden
const isVideo = (obj: ObjectType): obj is VideoSearch => 'ageInVideo' in obj
const isStar = (obj: ObjectType): obj is StarSearch => 'videoCount' in obj

const isTitleVisible = (obj: ObjectType, hidden: HiddenType) => {
  return obj.name.toLowerCase().includes(hidden.titleSearch.toLowerCase())
}

const isBreastVisible = (star: StarSearch, hidden: HiddenStar) => {
  // hidden is empty
  if (hidden.breast?.length === 0) return true

  // both are null
  if (hidden.breast === null && star.breast === null) return true

  // one is null, the other is not
  if (typeof hidden.breast !== typeof star.breast) return false

  // neither is null
  return hidden.breast?.toLowerCase() === star.breast?.toLowerCase()
}

const isHaircolorVisible = (star: StarSearch, hidden: HiddenStar) => {
  // hidden is empty
  if (hidden.haircolor.length === 0) return true

  // hidden is not empty
  return star.haircolor.some(haircolor => haircolor.toLowerCase() === hidden.haircolor.toLowerCase())
}

const isEthnicityVisible = (star: StarSearch, hidden: HiddenStar) => {
  // hidden is empty
  if (hidden.ethnicity.length === 0) return true

  // star has no ethnicity
  if (star.ethnicity === null) return false

  // hidden is not empty
  return hidden.ethnicity.toLowerCase() === star.ethnicity.toLowerCase()
}

function isWebsiteVisible(video: VideoSearch, hidden: HiddenVideo): boolean
function isWebsiteVisible(star: StarSearch, hidden: HiddenStar): boolean
function isWebsiteVisible(obj: ObjectType, hidden: HiddenType): boolean {
  // hidden is empty
  if (hidden.website.length === 0) return true

  // hidden is not empty
  if (isHiddenVideo(hidden) && isVideo(obj)) {
    return obj.website.toLowerCase() === hidden.website.toLowerCase()
  } else if (isHiddenStar(hidden) && isStar(obj)) {
    return obj.websites.some(website => website.toLowerCase() === hidden.website.toLowerCase())
  }

  return false
}

const isCategoryVisible = (video: VideoSearch, hidden: HiddenVideo) => {
  const categories = video.categories.map(category => category.toLowerCase())

  // hidden is empty
  if (hidden.category.length === 0) return true

  // category is null
  if (hidden.category.length > 0 && hidden.category.includes(null)) {
    // hidden and !hidden should always be hidden
    if (hidden.category.length > 1) {
      return false
    }

    // video is shown if unrated
    return video.categories.length === 0
  }

  // video has no category
  if (video.categories.length === 0) return false

  // hidden is not empty
  return hidden.category.every(category => category !== null && categories.includes(category.toLowerCase()))
}

const isAttributeVisible = (video: VideoSearch, hidden: HiddenVideo) => {
  const attributes = video.attributes.map(attribute => attribute.toLowerCase())

  // hidden is empty
  if (hidden.attribute.length === 0) return true

  // video has no attribute
  if (video.attributes.length === 0) return false

  // hidden is not empty
  return hidden.attribute.every(attribute => attributes.includes(attribute.toLowerCase()))
}

const isLocationVisible = (video: VideoSearch, hidden: HiddenVideo) => {
  const locations = video.locations.map(location => location.toLowerCase())

  // hidden is empty
  if (hidden.location.length === 0) return true

  // video has no location
  if (video.locations.length === 0) return false

  // hidden is not empty
  return hidden.location.every(loc => locations.includes(loc.toLowerCase()))
}

const isStarHidden = (star: StarSearch, hidden: HiddenStar) => {
  return !(
    isTitleVisible(star, hidden) &&
    isBreastVisible(star, hidden) &&
    isHaircolorVisible(star, hidden) &&
    isEthnicityVisible(star, hidden) &&
    isWebsiteVisible(star, hidden)
  )
}

const isVideoHidden = (video: VideoSearch, hidden: HiddenVideo) => {
  return !(
    isTitleVisible(video, hidden) &&
    isCategoryVisible(video, hidden) &&
    isAttributeVisible(video, hidden) &&
    isLocationVisible(video, hidden) &&
    isWebsiteVisible(video, hidden)
  )
}

export function isHidden(video: VideoSearch, hidden: HiddenVideo): boolean
export function isHidden(star: StarSearch, hidden: HiddenStar): boolean
export function isHidden(obj: ObjectType, hidden: HiddenType): boolean {
  if (isHiddenVideo(hidden)) {
    return isVideoHidden(obj as VideoSearch, hidden)
  }

  return isStarHidden(obj as StarSearch, hidden)
}

const getVisibleStars = (stars: StarSearch[], hidden: HiddenStar) => {
  return stars.filter(star => !isStarHidden(star, hidden))
}
const getVisibleVideos = (videos: VideoSearch[], hidden: HiddenVideo) => {
  return videos.filter(video => !isVideoHidden(video, hidden))
}

export function getVisible(videos: VideoSearch[], hidden: HiddenVideo): VideoSearch[]
export function getVisible(stars: StarSearch[], hidden: HiddenStar): StarSearch[]
export function getVisible(arr: ObjectType[], hidden: HiddenType): ObjectType[] {
  if (isHiddenVideo(hidden)) {
    return getVisibleVideos(arr as VideoSearch[], hidden)
  }

  return getVisibleStars(arr as StarSearch[], hidden)
}