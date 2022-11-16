import axios from 'axios'

import apiUrl from '@utils/client/api'

const api = axios.create({
  baseURL: apiUrl('generate')
})

export default {
  metadata: async () => api.post('/meta')
}
