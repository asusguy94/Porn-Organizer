import axios from 'axios'
import { useFetch } from 'usehooks-ts'

import apiUrl from '@utils/client/api'
import { General } from '@interfaces'

const baseURL = apiUrl('location')
const api = axios.create({ baseURL })

export default {
  useLocations: () => useFetch<General[]>(baseURL),
  removeVideo: (videoID: number, locationID: number) => api.delete(`/${videoID}/${locationID}`)
}
