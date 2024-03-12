import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { Missing, Similar, Star, StarVideo } from '@/interface'
import { keys } from '@/keys'

const { api: newApi, legacyApi: newLegacyApi } = createApi('/star', { serverKey: 'newApi' })

type StarInfo = {
  breast: string[]
  haircolor: string[]
  ethnicity: string[]
}

export default {
  add: (star: string) => newLegacyApi.post('/', { name: star }),
  remove: (id: number) => newLegacyApi.delete(`/${id}`),
  renameStar: (id: number, name: string) => newLegacyApi.put(`/${id}`, { name }),
  setSlug: (id: number, slug: string) => newLegacyApi.put(`/${id}`, { slug }),
  ignoreStar: <T extends { id: number; ignored: boolean }>(star: T) => {
    return newLegacyApi.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  removeImage: (id: number) => newLegacyApi.delete(`/${id}/image`),
  useAddImage: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { url: string }>({
      mutationKey: ['star', id, 'addImage'],
      mutationFn: payload => newApi.post(`/${id}/image`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  getImages: (id: number) => newLegacyApi.post<{ images: string[] }>(`/${id}/api/image`),
  useAddHaircolor: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { name: string }>({
      mutationKey: ['star', id, 'addHaircolor'],
      mutationFn: payload => newApi.put(`/${id}/haircolor`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  },
  removeHaircolor: (id: number, name: string) => newLegacyApi.put(`/${id}/haircolor`, { name, remove: true }),
  updateInfo: (id: number, label: string, value: string) => {
    return newLegacyApi.put<{ reload: boolean; content: string | Date | number | null; similar: Similar[] }>(`/${id}`, {
      label,
      value
    })
  },
  resetInfo: (id: number) => newLegacyApi.delete(`/${id}/api`),
  getData: (id: number) => newLegacyApi.post(`/${id}/api`),
  useInfo: () => {
    const query = useQuery<StarInfo>({
      ...keys.star.info,
      queryFn: () => newApi.get('/info')
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
      queryFn: () => newApi.get('')
    })

    return { data: query.data }
  },
  useVideos: (id: number) => {
    const query = useQuery<StarVideo[]>({
      ...keys.star.byId(id)._ctx.video,
      queryFn: () => newApi.get(`/${id}/video`)
    })

    return { data: query.data }
  },
  useStar: (id: number) => {
    const query = useQuery<Star>({
      ...keys.star.byId(id),
      queryFn: () => newApi.get(`/${id}`)
    })

    return { data: query.data }
  },
  useSetRetired: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { retired: boolean }>({
      mutationKey: ['star', id, 'retired'],
      mutationFn: payload => newLegacyApi.put(`/${id}`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.star.byId(id) })
    })

    return { mutate }
  }
}
