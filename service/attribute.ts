import { useFetch } from 'usehooks-ts'

import { General } from '@interfaces'

import { createApi } from '@config'
const { api, baseURL } = createApi('/attribute')

export default {
  useAttributes: () => useFetch<General[]>(baseURL),
  removeVideo: (videoID: number, attributeID: number) => api.delete(`${baseURL}/${videoID}/${attributeID}`)
}
