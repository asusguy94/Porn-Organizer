import { keys } from '@keys'
import { useMutation, useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Missing, Similar, Star, StarVideo } from '@interfaces'

const { api, legacyApi } = createApi('/star')

type StarInfo = {
  breast: string[]
  haircolor: string[]
  ethnicity: string[]
}

export default {
  add: (star: string) => legacyApi.post('/', { name: star }),
  remove: (id: number) => legacyApi.delete(`/${id}`),
  renameStar: (id: number, name: string) => legacyApi.put(`/${id}`, { name }),
  setSlug: (id: number, slug: string) => legacyApi.put(`/${id}`, { slug }),
  ignoreStar: <T extends { id: number; ignored: boolean }>(star: T) => {
    return legacyApi.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  removeImage: (id: number) => legacyApi.delete(`/${id}/image`),
  useAddImage: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { url: string }>({
      mutationKey: ['star', id, 'addImage'],
      mutationFn: payload => api.post(`/${id}/image`, payload)
    })

    return { mutate }
  },
  getImages: (id: number) => legacyApi.post<{ images: string[] }>(`/${id}/api/image`),
  addHaircolor: (id: number, name: string) => legacyApi.put(`/${id}/haircolor`, { name }),
  removeHaircolor: (id: number, name: string) => legacyApi.put(`/${id}/haircolor`, { name, remove: true }),
  updateInfo: (id: number, label: string, value: string) =>
    legacyApi.put<{ reload: boolean; content: string | Date | number | null; similar: Similar[] }>(`/${id}`, {
      label,
      value
    }),
  resetInfo: (id: number) => legacyApi.delete(`/${id}/api`),
  getData: (id: number) => legacyApi.post(`/${id}/api`),
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
  }
}
