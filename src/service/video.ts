import { useMutation, useQuery } from '@tanstack/react-query'

import { createApi } from '@config'
import { Bookmark, File, Video, VideoStar } from '@interfaces'

const { api, legacyApi } = createApi('/video')

export default {
  addBookmark: (id: number, categoryID: number, time: number) => {
    return legacyApi.post<Bookmark>(`/${id}/bookmark`, { categoryID, time })
  },
  useAddBookmark: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { categoryID: number; time: number }>({
      mutationKey: ['video', id, 'bookmark', 'add'],
      mutationFn: payload => api.post(`/${id}/bookmark`, payload)
    })

    return { mutate }
  },
  addStar: (id: number, star: string) => legacyApi.post<VideoStar>(`/${id}/star`, { name: star }),
  removeStar: (id: number) => legacyApi.delete(`/${id}/star`),
  useAddLocation: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { locationID: number }>({
      mutationKey: ['video', id, 'location', 'add'],
      mutationFn: payload => api.post(`/${id}/location`, payload)
    })

    return { mutate }
  },
  useAddAttribute: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { attributeID: number }>({
      mutationKey: ['video', id, 'attribute', 'add'],
      mutationFn: payload => api.post(`/${id}/attribute`, payload)
    })

    return { mutate }
  },
  fixDate: (id: number) => legacyApi.put(`/${id}/fix-date`),
  renameTitle: (id: number, title: string) => legacyApi.put(`/${id}`, { title }),
  useRenameTitle: (id: number) => {
    const { mutate } = useMutation<unknown, Error, { title: string }>({
      mutationKey: ['video', 'rename', 'title'],
      mutationFn: payload => api.put(`/${id}`, { title: payload.title })
    })

    return { mutate }
  },
  getSlugs: (id: number) => {
    return legacyApi.get<
      {
        id: string
        title: string
        image: string
        site: string
        date: string
      }[]
    >(`/${id}/meta`)
  },
  setSlug: (id: number, slug: string) => legacyApi.put(`/${id}`, { slug }),
  addPlay: (id: number) => legacyApi.put(`/${id}`, { plays: 1 }),
  delete: (id: number) => legacyApi.delete(`/${id}`),
  removeBookmark: (id: number) => legacyApi.delete(`/${id}/bookmark`),
  removePlays: (id: number) => legacyApi.put(`/${id}`, { plays: 0 }),
  rename: (id: number, path: string) => legacyApi.put(`/${id}`, { path }),
  setThumbnail: (id: number) => legacyApi.put(`/${id}`, { cover: true }),
  validateTitle: (id: number) => legacyApi.put(`/${id}`, { validated: true }),
  getVideoInfo: (id: number) => {
    return legacyApi.get<{
      id: string
      title: string
      date: string
      image: string
    }>(`/${id}/star/info`)
  },
  useAddVideos: () => {
    const { mutate } = useMutation<unknown, Error, { videos: File[] }>({
      mutationKey: ['video', 'new', 'add'],
      mutationFn: payload => api.post('/add', payload)
    })

    return { mutate }
  },
  useNew: () => {
    const query = useQuery<{ files: File[]; pages: number }>({
      queryKey: ['video', 'new'],
      queryFn: () => api.get('/add')
    })

    return { data: query.data }
  },
  useBookmarks: (id: number) => {
    const query = useQuery<Bookmark[]>({
      queryKey: ['video', id, 'bookmark'],
      queryFn: () => api.get(`/${id}/bookmark`)
    })

    return { data: query.data }
  },
  useVideo: (id: number) => {
    const query = useQuery<Video>({
      queryKey: ['video', id],
      queryFn: () => api.get(`/${id}`)
    })

    return { data: query.data }
  },
  useStar: (id: number) => {
    const query = useQuery<VideoStar>({
      queryKey: ['video', id, 'star'],
      queryFn: () => api.get(`/${id}/star`)
    })

    return { data: query.data }
  }
}
