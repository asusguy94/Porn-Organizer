import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { createApi } from '@/config'
import { Bookmark, File, Video, VideoStar } from '@/interface'
import { keys } from '@/keys'

const { api: newApi, legacyApi: newLegacyApi } = createApi('/video', { serverKey: 'newApi' })

export default {
  useAddBookmark: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { categoryID: number; time: number }>({
      mutationKey: ['video', id, 'bookmark', 'add'],
      mutationFn: payload => newApi.post(`/${id}/bookmark`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id)._ctx.bookmark })
    })

    return { mutate }
  },
  addStar: (id: number, star: string) => newLegacyApi.post<VideoStar>(`/${id}/star`, { name: star }),
  removeStar: (id: number) => newLegacyApi.delete(`/${id}/star`),
  useAddLocation: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { locationID: number }>({
      mutationKey: ['video', id, 'location', 'add'],
      mutationFn: payload => newApi.post(`/${id}/location`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id) })
    })

    return { mutate }
  },
  useAddAttribute: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { attributeID: number }>({
      mutationKey: ['video', id, 'attribute', 'add'],
      mutationFn: payload => newApi.post(`/${id}/attribute`, payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id) })
    })

    return { mutate }
  },
  fixDate: (id: number) => newLegacyApi.put(`/${id}/fix-date`),
  renameTitle: (id: number, title: string) => newLegacyApi.put(`/${id}`, { title }),
  useRenameTitle: (id: number) => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { title: string }>({
      mutationKey: ['video', 'rename', 'title'],
      mutationFn: payload => newApi.put(`/${id}`, { title: payload.title }),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.byId(id) })
    })

    return { mutate }
  },
  getSlugs: (id: number) => {
    return newLegacyApi.get<
      {
        id: string
        title: string
        image: string
        site: string
        date: string
      }[]
    >(`/${id}/meta`)
  },
  setSlug: (id: number, slug: string) => newLegacyApi.put(`/${id}`, { slug }),
  addPlay: (id: number) => newApi.put(`/${id}`, { plays: 1 }),
  delete: (id: number) => newLegacyApi.delete(`/${id}`),
  removeBookmark: (id: number) => newLegacyApi.delete(`/${id}/bookmark`),
  removePlays: (id: number) => newLegacyApi.put(`/${id}`, { plays: 0 }),
  rename: (id: number, path: string) => newLegacyApi.put(`/${id}`, { path }),
  setThumbnail: (id: number) => newLegacyApi.put(`/${id}`, { cover: true }),
  validateTitle: (id: number) => newLegacyApi.put(`/${id}`, { validated: true }),
  getVideoInfo: (id: number) => {
    return newLegacyApi.get<{
      id: string
      title: string
      date: string
      image: string
    }>(`/${id}/star/info`)
  },
  useAddVideos: () => {
    const queryClient = useQueryClient()

    const { mutate } = useMutation<unknown, Error, { videos: File[] }>({
      mutationKey: ['video', 'new', 'add'],
      mutationFn: payload => newApi.post('/add', payload),
      onSuccess: () => queryClient.invalidateQueries({ ...keys.video.new })
    })

    return { mutate }
  },
  useNew: () => {
    const query = useQuery<{ files: File[]; pages: number }>({
      ...keys.video.new,
      queryFn: () => newApi.get('/add')
    })

    return { data: query.data }
  },
  useBookmarks: (id: number) => {
    const query = useQuery<Bookmark[]>({
      ...keys.video.byId(id)._ctx.bookmark,
      queryFn: () => newApi.get(`/${id}/bookmark`)
    })

    return { data: query.data }
  },
  useVideo: (id: number) => {
    const query = useQuery<Video>({
      ...keys.video.byId(id),
      queryFn: () => newApi.get(`/${id}`)
    })

    return { data: query.data }
  },
  useStar: (id: number) => {
    const query = useQuery<VideoStar | null>({
      ...keys.video.byId(id)._ctx.star,
      queryFn: () => newApi.get(`/${id}/star`)
    })

    return { data: query.data }
  }
}
