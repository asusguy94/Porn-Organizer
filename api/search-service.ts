import { useFetch } from 'usehooks-ts'

import apiUrl from '@utils/client/api'
import type { StarSearch, VideoSearch } from '@components/search/helper'

const baseURL = apiUrl('search')

export default {
  useStars: () => useFetch<StarSearch[]>(`${baseURL}/star`),
  useVideos: () => useFetch<VideoSearch[]>(`${baseURL}/video`)
}
