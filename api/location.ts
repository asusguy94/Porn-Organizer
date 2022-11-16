import axios from 'axios'

import apiUrl from '@utils/client/api'
import { IGeneral } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('location')
})

export default {
  getAll: async () => api.get<IGeneral[]>('/'),
  removeVideo: async (videoID: number, locationID: number) => await api.delete(`/${videoID}/${locationID}`)
}
