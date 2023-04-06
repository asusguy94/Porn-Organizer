import axios from 'axios'
import serverConfig from './server'

function createApi(suffix: string) {
  const baseURL = serverConfig.api + suffix

  return { api: axios.create({ baseURL }), baseURL }
}

export default createApi
