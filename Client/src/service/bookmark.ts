import { createApi } from '@config'

const { api } = createApi('/bookmark')

export default {
  setTime: (id: number, time: number) => api.put(`/${id}`, { time }),
  delete: (id: number) => api.delete(`/${id}`),
  setCategory: (id: number, categoryID: number) => api.put(`/${id}`, { categoryID })
}
