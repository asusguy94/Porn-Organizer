import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { General } from '@/interface'
import { keys } from '@/keys'

const { api: newApi } = createApi('/category', { serverKey: 'newApi' })

export default {
  useAll: () => {
    const query = useQuery<General[]>({
      ...keys.category.all,
      queryFn: () => newApi.get('')
    })

    return { data: query.data }
  }
}
