import axios from 'axios'

import { IStarVideo } from '@interfaces'
import { serverConfig } from '@config'

const api = axios.create({
  baseURL: `${serverConfig.api}/star`
})

export default {
  add: async (star: string) => await api.post('/', { name: star }),
  get: async <T>(id: number) => await api.get<T>(`/${id}`),
  remove: async (id: number) => await api.delete(`/${id}`),
  getVideos: async (id: number) => await api.get<IStarVideo[]>(`/${id}/video`),
  renameStar: async (id: number, name: string) => await api.put(`/${id}`, { name }),
  setSlug: async (id: number, slug: string) => await api.put(`/${id}`, { slug }),
  ignoreStar: async <T extends { id: number; ignored: boolean }>(star: T) => {
    return await api.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  addAlias: async (id: number, alias: string) => await api.post(`/${id}/alias`, { alias }),
  removeImage: async (id: number) => await api.delete(`/${id}/image`),
  addImage: async <T = any>(id: number, url: string) => await api.post<T>(`/${id}/image`, { url }),
  getImages: async (id: number) => await api.post<{ images: string[] }>(`/${id}/api/image`),
  updateInfo: async <T = any>(id: number, label: string, value: string) => await api.put<T>(`/${id}`, { label, value }),
  resetInfo: async (id: number) => await api.delete(`/${id}/api`),
  getData: async <T = any>(id: number) => await api.post<T>(`/${id}/api`)
}
