import axios from 'axios'

import apiUrl from '@utils/client/api'

const api = axios.create({
  baseURL: apiUrl('bookmark')
})

export default {
  setTime: (id: number, time: number) => api.put(`/${id}`, { time }),
  delete: (id: number) => api.delete(`/${id}`),
  setCategory: (id: number, categoryID: number) => api.put(`/${id}`, { categoryID })
}
