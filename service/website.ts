import { useFetch } from 'usehooks-ts'

import { WebsiteWithSites } from '@interfaces'

import { createApi } from '@config'
const { baseURL } = createApi('/website')

export default {
  useWebsites: () => useFetch<WebsiteWithSites[]>(baseURL)
}
