import axios from 'axios'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/generate`
})

export default {
  metadata: async () => api.post('/meta')
}
