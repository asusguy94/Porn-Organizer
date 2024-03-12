import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { keys } from '@/keys'

const { api: newApi } = createApi('/bookmark', { serverKey: 'newApi' })

export default {
  useSetTime: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => newApi.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useDeleteBookmark: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number }>({
      mutationKey: ['bookmark', 'delete'],
      mutationFn: ({ id }) => newApi.delete(`/${id}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetCategory: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => newApi.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  }
}
