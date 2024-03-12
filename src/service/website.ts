import { useQuery } from '@tanstack/react-query'

import createApi from '../config/api'

import { WebsiteWithCount } from '@/interface'
import { keys } from '@/keys'

const { api: newApi } = createApi('/website', { serverKey: 'newApi' })

export default {
  useAll: () => {
    const query = useQuery<WebsiteWithCount[]>({
      ...keys.website.all,
      queryFn: () => newApi.get('')
    })

    return { data: query.data }
  }
}
