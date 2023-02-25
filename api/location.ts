import axios from 'axios'

import apiUrl from '@utils/client/api'
import { General } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('location')
})

export default {
  getAll: async () => api.get<General[]>('/'),
  removeVideo: async (videoID: number, locationID: number) => await api.delete(`/${videoID}/${locationID}`)
}
