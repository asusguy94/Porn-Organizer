import { Bookmark, General, VideoStar } from '@interfaces'

import { createApi } from '@config'
const { api } = createApi('/video')

export default {
  addBookmark: (id: number, categoryID: number, time: number) => {
    return api.post<Bookmark>(`/${id}/bookmark`, { categoryID, time })
  },
  addStar: (id: number, star: string) => api.post<VideoStar>(`/${id}/star`, { name: star }),
  removeStar: (id: number) => api.delete(`/${id}/star`),
  addLocation: (id: number, locationID: number) => api.post<General>(`/${id}/location`, { locationID }),
  addAttribute: (id: number, attributeID: number) => api.post<General>(`/${id}/attribute`, { attributeID }),
  fixDate: (id: number) => api.put(`/${id}/fix-date`),
  renameTitle: (id: number, title: string) => api.put(`/${id}`, { title }),
  getSlugs: (id: number) =>
    api.get<
      {
        id: string
        title: string
        image: string
        site: string
        date: string
      }[]
    >(`/${id}/meta`),
  setSlug: (id: number, slug: string) => api.put(`/${id}`, { slug }),
  addPlay: (id: number) => api.put(`/${id}`, { plays: 1 }),
  delete: (id: number) => api.delete(`/${id}`),
  setStarAge: (id: number, age: number) => api.put(`/${id}`, { starAge: !isNaN(age) ? age : null }),
  removeBookmark: (id: number) => api.delete(`/${id}/bookmark`),
  removePlays: (id: number) => api.put(`/${id}`, { plays: 0 }),
  rename: (id: number, path: string) => api.put(`/${id}`, { path }),
  setThumbnail: (id: number) => api.put(`/${id}`, { cover: true }),
  validateTitle: (id: number) => api.put(`/${id}`, { validated: true }),
  getVideoInfo: (id: number) => {
    return api.get<{
      id: string
      title: string
      date: string
      image: string
    }>(`/${id}/star/info`)
  },
  addVideos: <T>(videos: T) => api.post('/add', { videos })
}
