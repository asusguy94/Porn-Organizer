import axios from 'axios'

import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/attribute`
})

export default {
  removeVideo: async (videoID: number, attributeID: number) => await api.delete(`/${videoID}/${attributeID}`)
}
