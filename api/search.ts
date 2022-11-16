import axios from 'axios'

import apiUrl from '@utils/client/api'
import { IndexType, MakeOptional } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('search')
})

export default {
  getStars: async <T extends IndexType>() => await api.get<MakeOptional<T, 'hidden' | 'score'>[]>('/star'),
  getVideos: async <T extends IndexType>() => await api.get<MakeOptional<T, 'hidden'>[]>('/video')
}
