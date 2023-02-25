import axios from 'axios'

import apiUrl from '@utils/client/api'
import { General } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('attribute')
})

export default {
  getAll: async () => api.get<General[]>('/'),
  removeVideo: async (videoID: number, attributeID: number) => await api.delete(`/${videoID}/${attributeID}`)
}
