import { useFetch } from 'usehooks-ts'

import { Similar, StarVideo } from '@interfaces'

import { createApi } from '@config'
const { api, baseURL } = createApi('/star')

const defaultNumber = 0
export default {
  useStarInfo: () => useFetch<{ breast: string[]; haircolor: string[]; ethnicity: string[] }>(baseURL),
  useStarMissing: <S, M>() => useFetch<{ stars: S[]; missing: M[] }>(`${baseURL}/missing`),
  add: (star: string) => api.post('/', { name: star }),
  useStar: <T>(id: number = defaultNumber) => useFetch<T>(`${baseURL}/${id}`),
  remove: (id: number) => api.delete(`/${id}`),
  useStarVideos: (id: number = defaultNumber) => useFetch<StarVideo[]>(`${baseURL}/${id}/video`),
  renameStar: (id: number, name: string) => api.put(`/${id}`, { name }),
  setSlug: (id: number, slug: string) => api.put(`/${id}`, { slug }),
  ignoreStar: <T extends { id: number; ignored: boolean }>(star: T) => {
    return api.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  addAlias: (id: number, alias: string) => api.post(`/${id}/alias`, { alias }),
  removeImage: (id: number) => api.delete(`/${id}/image`),
  addImage: (id: number, url: string) => api.post<{ image: string }>(`/${id}/image`, { url }),
  getImages: (id: number) => api.post<{ images: string[] }>(`/${id}/api/image`),
  updateInfo: (id: number, label: string, value: string) =>
    api.put<{ reload: boolean; content: string | Date | number | null; similar: Similar[] }>(`/${id}`, {
      label,
      value
    }),
  resetInfo: (id: number) => api.delete(`/${id}/api`),
  getData: (id: number) => api.post(`/${id}/api`)
}
