import { useFetch } from 'usehooks-ts'

import type { StarSearch, VideoSearch } from '@components/search/helper'

import { createApi } from '@config'
const { baseURL } = createApi('/search')

export default {
  useStars: () => useFetch<StarSearch[]>(`${baseURL}/star`),
  useVideos: () => useFetch<VideoSearch[]>(`${baseURL}/video`)
}
