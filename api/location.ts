import axios from 'axios'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/location`
})

export default {
  removeVideo: async (videoID: number, locationID: number) => await api.delete(`/${videoID}/${locationID}`)
}
