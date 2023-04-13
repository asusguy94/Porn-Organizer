import { useFetch } from 'usehooks-ts'

import { General } from '@interfaces'

import { createApi } from '@config'
const { api, baseURL } = createApi('/location')

export default {
  useLocations: () => useFetch<General[]>(baseURL),
  removeVideo: (videoID: number, locationID: number) => api.delete(`/${videoID}/${locationID}`)
}
