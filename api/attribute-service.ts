import axios from 'axios'
import { useFetch } from 'usehooks-ts'

import apiUrl from '@utils/client/api'
import { General } from '@interfaces'

const baseURL = apiUrl('attribute')
const api = axios.create({ baseURL })

export default {
  useAttributes: () => useFetch<General[]>(baseURL),
  removeVideo: (videoID: number, attributeID: number) => api.delete(`${baseURL}/${videoID}/${attributeID}`)
}
