import axios from 'axios'

import apiUrl from '@utils/client/api'

const api = axios.create({
  baseURL: apiUrl('bookmark')
})

export default {
  setTime: async (id: number, time: number) => api.put(`/${id}`, { time }),
  delete: async (id: number) => api.delete(`/${id}`),
  setCategory: async (id: number, categoryID: number) => api.put(`/${id}`, { categoryID })
}
