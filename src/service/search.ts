import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { StarSearch, VideoSearch } from '@/interface'
import { keys } from '@/keys'

const { api: newApi } = createApi('/search', { serverKey: 'newApi' })

export default {
  useStars: () => {
    const query = useQuery<StarSearch[]>({
      ...keys.search.star,
      queryFn: () => newApi.get('/star'),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  },
  useVideos: () => {
    const query = useQuery<VideoSearch[]>({
      ...keys.search.video,
      queryFn: () => newApi.get('/video'),
      placeholderData: prevData => prevData
    })

    return { data: query.data, isLoading: query.isFetching }
  }
}
