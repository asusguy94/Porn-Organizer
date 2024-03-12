import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { General } from '@/interface'
import { keys } from '@/keys'

const { api: newApi } = createApi('/attribute', { serverKey: 'newApi' })

export default {
  useRemoveVideo: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { attributeId: number }>({
      mutationKey: ['video', videoId, 'removeAttribute'],
      mutationFn: ({ attributeId }) => newApi.delete(`/${attributeId}/${videoId}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId) })
    })

    return { mutate }
  },
  useAll: () => {
    const query = useQuery<General[]>({
      ...keys.attribute.all,
      queryFn: () => newApi.get('')
    })

    return { data: query.data }
  }
}
