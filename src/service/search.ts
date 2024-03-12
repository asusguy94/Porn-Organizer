import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { StarSearch, VideoSearch } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/search')

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>({
      ...keys.search.star,
      queryFn: () => api.get('/star'),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>({
      ...keys.search.video,
      queryFn: () => api.get('/video'),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
