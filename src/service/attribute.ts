import { keys } from '@keys'
import { useMutation, useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { General } from '@interfaces'

const { api } = createApi('/attribute')

export default {
  useRemoveVideo: (videoId: number) => {
    const { mutate } = useMutation<unknown, Error, { attributeId: number }>({
      mutationKey: ['attribute', 'removeVideo'],
      mutationFn: ({ attributeId }) => api.delete(`/${attributeId}/${videoId}`)
    })

    return { mutate }
  },
  useAll: () => {
    const query = useQuery<General[]>({
      ...keys.attribute.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
