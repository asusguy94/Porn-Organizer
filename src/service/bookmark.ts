import { keys } from '@keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'

const { api } = createApi('/bookmark')

export default {
  useSetTime: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useDeleteBookmark: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number }>({
      mutationKey: ['bookmark', 'delete'],
      mutationFn: ({ id }) => api.delete(`/${id}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetCategory: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId)._ctx.bookmark })
    })

    return { mutate }
  }
}
