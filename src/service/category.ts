import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { General } from '@interfaces'

const { api } = createApi('/location')

export default {
  useAll: () => {
    const query = useQuery<General[]>({
      queryKey: ['category'],
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
