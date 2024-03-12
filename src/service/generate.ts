import { createApi } from '@/config'

const { legacyApi: newLegacyApi } = createApi('/generate', { serverKey: 'newApi' })

export default {
  metadata: () => newLegacyApi.post('/meta'),
  vtt: () => newLegacyApi.post('/vtt')
}
