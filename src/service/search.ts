import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { StarSearch, VideoSearch } from '@interfaces'

const { api } = createApi('/search')

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>({
      queryKey: ['star'],
      queryFn: () => api.get('/star'),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>({
      queryKey: ['video'],
      queryFn: () => api.get('/video'),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
