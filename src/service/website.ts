import { useQuery } from '@tanstack/react-query'

import createApi from '../config/api'

import { WebsiteWithCount } from '@/interface'
import { keys } from '@/keys'

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
