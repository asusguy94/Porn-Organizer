import { Similar } from '@interfaces'

import { createApi } from '@config'
const { api } = createApi('/star')

export default {
  add: (star: string) => api.post('/', { name: star }),
  remove: (id: number) => api.delete(`/${id}`),
  renameStar: (id: number, name: string) => api.put(`/${id}`, { name }),
  setSlug: (id: number, slug: string) => api.put(`/${id}`, { slug }),
  ignoreStar: <T extends { id: number; ignored: boolean }>(star: T) => {
    return api.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
  },
  addAlias: (id: number, alias: string) => api.post(`/${id}/alias`, { alias }),
  removeImage: (id: number) => api.delete(`/${id}/image`),
  addImage: (id: number, url: string) => api.post<{ image: string }>(`/${id}/image`, { url }),
  getImages: (id: number) => api.post<{ images: string[] }>(`/${id}/api/image`),
  addHaircolor: (id: number, name: string) => api.put(`/${id}/haircolor`, { name }),
  removeHaircolor: (id: number, name: string) => api.put(`/${id}/haircolor`, { name, remove: true }),
  updateInfo: (id: number, label: string, value: string) =>
    api.put<{ reload: boolean; content: string | Date | number | null; similar: Similar[] }>(`/${id}`, {
      label,
      value
    }),
  resetInfo: (id: number) => api.delete(`/${id}/api`),
  getData: (id: number) => api.post(`/${id}/api`)
}
