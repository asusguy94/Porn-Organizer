import axios from 'axios'

import apiUrl from '@utils/client/api'
import { General } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('category')
})

export default {
  getAll: async () => api.get<General[]>('/')
}
