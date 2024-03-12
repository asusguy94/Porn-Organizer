import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { General } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/category')

export default {
  useAll: () => {
    const query = useQuery<General[]>({
      ...keys.category.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
