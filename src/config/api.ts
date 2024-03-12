import axios, { AxiosResponse } from 'axios'

import serverConfig from './server'

type Options = {
  serverKey: keyof typeof serverConfig
}

async function getResponse<T>(promise: Promise<AxiosResponse<T>>) {
  return promise.then(res => res.data)
}

export default function createApi(suffix: string, options?: Partial<Options>) {
  const baseURL = serverConfig[options?.serverKey ?? 'newApi'] + suffix

  const api = axios.create({ baseURL })

  return {
    api: {
      get: <T>(...args: Parameters<(typeof api)['get']>) => getResponse<T>(api.get(...args)),
      post: <T>(...args: Parameters<(typeof api)['post']>) => getResponse<T>(api.post(...args)),
      put: <T>(...args: Parameters<(typeof api)['put']>) => getResponse<T>(api.put(...args)),
      delete: <T>(...args: Parameters<(typeof api)['delete']>) => getResponse<T>(api.delete(...args))
    },
    legacyApi: api,
    baseURL
  }
}
