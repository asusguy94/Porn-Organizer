import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import createApi from '../config/api'

import { WebsiteWithCount } from '@interfaces'

const { api } = createApi('/website')

export default {
  useAll: () => {
    const query = useQuery<WebsiteWithCount[]>({
      ...keys.website.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
