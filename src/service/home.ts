import { useQuery } from '@tanstack/react-query'

import { createApi } from '@/config'
import { keys } from '@/keys'

const { api: newApi } = createApi('/home', { serverKey: 'newApi' })

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
      queryFn: () => newApi.get<Video[]>(`/${label}/${limit}`)
    })

    return { data: query.data }
  }
}
