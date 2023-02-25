import axios from 'axios'

import apiUrl from '@utils/client/api'
import type { StarSearch, VideoSearch } from '@components/search/helper'

const api = axios.create({
  baseURL: apiUrl('search')
})

export default {
  getStars: async () => await api.get<StarSearch[]>('/star'),
  getVideos: async () => await api.get<VideoSearch[]>('/video')
}
