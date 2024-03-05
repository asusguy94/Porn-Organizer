import { keys } from '@keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@config'
import { General } from '@interfaces'

const { api } = createApi('/location')

export default {
  useRemoveVideo: (videoId: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { locationId: number }>({
      mutationKey: ['location', 'removeVideo'],
      mutationFn: ({ locationId }) => api.delete(`/${locationId}/${videoId}`),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(videoId) })
    })

    return { mutate }
  },
  useAll: () => {
    const query = useQuery<General[]>({
      ...keys.location.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  }
}
