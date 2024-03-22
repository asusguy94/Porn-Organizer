import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { Missing, Similar, Star, StarVideo } from '@/interface'
import { keys } from '@/keys'

const { api } = createApi('/star')

type StarInfo = {
  breast: string[]
  haircolor: string[]
  ethnicity: string[]
}

export default {
  useAddStar: () => {
    const queryClient = useQueryClient()

    type Payload = { name: string }
    const { mutate: mutateSync, mutateAsync } = useMutation<unknown, Error, Payload>({
      mutationKey: ['star', 'add'],
      mutationFn: payload => api.post('/', payload)
    })

    const mutate = (payload: Payload) => {
      mutateSync(payload, {
        onSuccess: () => {
          queryClient.invalidateQueries(keys.star.all)
        }
      })
    }

    const mutateAll = (payloads: Payload[]) => {
      Promise.allSettled(payloads.map(payload => mutateAsync(payload))).then(() => {
        queryClient.invalidateQueries(keys.star.all)
      })
    }

    return { mutate, mutateAll }
  },
  remove: (id: number) => api.delete(`/${id}`),
  renameStar: (id: number, name: string) => api.put(`/${id}`, { name }),
  setSlug: (id: number, slug: string) => api.put(`/${id}`, { slug }),
  ignoreStar: <T extends { id: number; ignored: boolean }>(star: T) => {
    return api.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  removeImage: (id: number) => api.delete(`/${id}/image`),
  useAddImage: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { url: string }>({
      mutationKey: ['star', id, 'addImage'],
      mutationFn: payload => api.post(`/${id}/image`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  getImages: (id: number) => api.post<{ images: string[] }>(`/${id}/api/image`),
  useAddHaircolor: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'addHaircolor'],
      mutationFn: payload => api.put(`/${id}/haircolor`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  removeHaircolor: (id: number, name: string) => api.put(`/${id}/haircolor`, { name, remove: true }),
  updateInfo: (id: number, label: string, value: string) => {
    return api.put<{ reload: boolean; content: string | Date | number | null; similar: Similar[] }>(`/${id}`, {
      label,
      value
    })
  },
  resetInfo: (id: number) => api.delete(`/${id}/api`),
  getData: (id: number) => api.post(`/${id}/api`),
  useInfo: () => {
    const query = useQuery<StarInfo>({
      ...keys.star.info,
      queryFn: () => api.get('/info')
    })

    return { data: query.data }
  },
  useAll: () => {
    type Star = {
      id: number
      name: string
      image: string | null
    }

    const query = useQuery<{ stars: Star[]; missing: Missing[] }>({
      ...keys.star.all,
      queryFn: () => api.get('')
    })

    return { data: query.data }
  },
  useVideos: (id: number) => {
    const query = useQuery<StarVideo[]>({
      ...keys.star.byId(id)._ctx.video,
      queryFn: () => api.get(`/${id}/video`)
    })

    return { data: query.data }
  },
  useStar: (id: number) => {
    const query = useQuery<Star>({
      ...keys.star.byId(id),
      queryFn: () => api.get(`/${id}`)
    })

    return { data: query.data }
  },
  useSetRetired: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { retired: boolean }>({
      mutationKey: ['star', id, 'retired'],
      mutationFn: payload => api.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  }
}
