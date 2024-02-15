import { createApi } from '@config'

const { api } = createApi('/location')

export default {
  removeVideo: (videoID: number, locationID: number) => api.delete(`/${locationID}/${videoID}`)
}
