import { keys } from '@keys'
import { useQuery } from '@tanstack/react-query'

import { createApi } from '@config'

const { api } = createApi('/home')

type Video = {
  id: number
  name: string
  image: string | null
  total?: number
}

export default {
  useVideos: (label: string, limit: number) => {
    const query = useQuery<Video[]>({
      ...keys.video.home(label),
      queryFn: () => api.get<Video[]>(`/${label}/${limit}`)
    })

    return { data: query.data }
  }
}
