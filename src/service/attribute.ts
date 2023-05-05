import { createApi } from '@config'
const { api } = createApi('/attribute')

export default {
  removeVideo: (videoID: number, attributeID: number) => api.delete(`/${videoID}/${attributeID}`)
}
