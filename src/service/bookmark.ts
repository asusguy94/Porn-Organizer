import { useMutation } from '@tanstack/react-query'

import { createApi } from '@config'

const { api, legacyApi } = createApi('/bookmark')

export default {
  useSetTime: () => {
    const { mutate } = useMutation<unknown, Error, { id: number; time: number }>({
      mutationKey: ['bookmark', 'setTime'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload)
    })

    return { mutate }
  },
  delete: (id: number) => legacyApi.delete(`/${id}`),
  useSetCategory: () => {
    const { mutate } = useMutation<unknown, Error, { id: number; categoryID: number }>({
      mutationKey: ['bookmark', 'setCategory'],
      mutationFn: ({ id, ...payload }) => api.put(`/${id}`, payload)
    })

    return { mutate }
  }
}
