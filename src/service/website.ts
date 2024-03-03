import { useQuery } from '@tanstack/react-query'

import createApi from '../config/api'

import { WebsiteWithCount } from '@interfaces'

const { api } = createApi('/website')

export default {
  useAll: () => {
    const query = useQuery<WebsiteWithCount[]>({
      queryKey: ['website'],
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
