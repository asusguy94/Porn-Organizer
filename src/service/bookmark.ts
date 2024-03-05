import { keys } from '@keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'

const { api } = createApi('/bookmark')

export default {
  useSetTime: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  useDeleteBookmark: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number }>({
      mutationKey: ['bookmark', 'delete'],
      mutationFn: ({ id }) => api.delete(`/${id}`),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  useSetCategory: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload),
      onSuccess: (_, { id }) => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  }
}
