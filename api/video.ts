import axios from 'axios'

import apiUrl from '@utils/client/api'
import { IGeneral, IVideoStar } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('video')
})

export default {
  get: async <T>(id: number) => await api.get<T>(`/${id}`),
  getBookmarks: async <T>(id: number) => await api.get<T>(`/${id}/bookmark`),
  addBookmark: async <T = any>(id: number, categoryID: number, time: number) => {
    return await api.post<T>(`/${id}/bookmark`, { categoryID, time })
  },
  getStar: async <T>(id: number) => await api.get<T | ''>(`/${id}/star`),
  addStar: async (id: number, star: string) => await api.post<IVideoStar>(`/${id}/star`, { name: star }),
  removeStar: async (id: number) => await api.delete(`/${id}/star`),
  addLocation: async (id: number, locationID: number) => {
    return await api.post<IGeneral>(`/${id}/location`, { locationID })
  },
  addAttribute: async (id: number, attributeID: number) => {
    return await api.post<IGeneral>(`/${id}/attribute`, { attributeID })
  },
  fixDate: async (id: number) => await api.put(`/${id}/fix-date`),
  renameTitle: async (id: number, title: string) => await api.put(`/${id}`, { title }),
  setSlug: async (id: number, slug: string) => await api.put(`/${id}`, { slug }),
  addPlay: async (id: number) => await api.put(`/${id}`, { plays: 1 }),
  delete: async (id: number) => await api.delete(`/${id}`),
  setStarAge: async (id: number, age: number) => await api.put(`/${id}`, { starAge: !isNaN(age) ? age : null }),
  removeBookmark: async (id: number) => await api.delete(`/${id}/bookmark`),
  removePlays: async (id: number) => await api.put(`/${id}`, { plays: 0 }),
  rename: async (id: number, path: string) => api.put(`/${id}`, { path }),
  setThumbnail: async (id: number) => api.put(`/${id}`, { cover: true }),
  getStarInfo: async <T>(id: number) => api.get<T>(`${id}/star/info`),
  newVideos: async <T>() => api.post<T>('/'),
  addVideos: async <T>(videos: T) => api.post('/add', { videos })
}
