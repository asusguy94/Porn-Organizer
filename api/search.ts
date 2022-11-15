import axios from 'axios'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/search`
})

export default {
  getStars: async <T>() => await api.get<T>('/star'),
  getVideos: async <T>() => await api.get<T>('/video')
}
