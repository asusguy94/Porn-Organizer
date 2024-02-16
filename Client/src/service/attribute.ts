import { createApi } from '@/config'

const { api } = createApi('/attribute')

export default {
  removeVideo: (videoID: number, attributeId: number) => api.delete(`/${attributeId}/${videoID}`)
}
