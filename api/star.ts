import axios from 'axios'

import apiUrl from '@utils/client/api'
import type { Similar, StarVideo } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('star')
})

export default {
  getInfo: async () => await api.get<{ breast: string[]; haircolor: string[]; ethnicity: string[] }>('/'),
  getMissing: async <S, M>() => await api.get<{ stars: S[]; missing: M[] }>('/missing'),
  add: async (star: string) => await api.post('/', { name: star }),
  get: async <T>(id: number) => await api.get<T>(`/${id}`),
  remove: async (id: number) => await api.delete(`/${id}`),
  getVideos: async (id: number) => await api.get<StarVideo[]>(`/${id}/video`),
  renameStar: async (id: number, name: string) => await api.put(`/${id}`, { name }),
  setSlug: async (id: number, slug: string) => await api.put(`/${id}`, { slug }),
  ignoreStar: async <T extends { id: number; ignored: boolean }>(star: T) => {
    return await api.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  addAlias: async (id: number, alias: string) => await api.post(`/${id}/alias`, { alias }),
  removeImage: async (id: number) => await api.delete(`/${id}/image`),
  addImage: async (id: number, url: string) => await api.post<{ image: string }>(`/${id}/image`, { url }),
  getImages: async (id: number) => await api.post<{ images: string[] }>(`/${id}/api/image`),
  updateInfo: async (id: number, label: string, value: string) =>
    await api.put<{ reload: boolean; content: string | Date | number | null; similar: Similar[] }>(`/${id}`, {
      label,
      value
    }),
  resetInfo: async (id: number) => await api.delete(`/${id}/api`),
  getData: async (id: number) => await api.post(`/${id}/api`)
}
