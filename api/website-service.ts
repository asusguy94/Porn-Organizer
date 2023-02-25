import { useFetch } from 'usehooks-ts'

import apiUrl from '@utils/client/api'
import { WebsiteWithSites } from '@interfaces'

const baseURL = apiUrl('website')

export default {
  useWebsites: () => useFetch<WebsiteWithSites[]>(baseURL)
}
