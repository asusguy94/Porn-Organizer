import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { General } from '@interfaces'

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
