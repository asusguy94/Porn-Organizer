import { createApi } from '@config'

const { legacyApi } = createApi('/bookmark')

export default {
  setTime: (id: number, time: number) => legacyApi.put(`/${id}`, { time }),
  delete: (id: number) => legacyApi.delete(`/${id}`),
  setCategory: (id: number, categoryID: number) => legacyApi.put(`/${id}`, { categoryID })
}
