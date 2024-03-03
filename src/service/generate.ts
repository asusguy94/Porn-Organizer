import { createApi } from '@config'

const { legacyApi } = createApi('/generate')

export default {
  metadata: () => legacyApi.post('/meta'),
  vtt: () => legacyApi.post('/vtt')
}
