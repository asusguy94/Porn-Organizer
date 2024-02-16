import { createApi } from '@/config'

const { api } = createApi('/generate')

export default {
  metadata: () => api.post('/meta'),
  vtt: () => api.post('/vtt')
}
