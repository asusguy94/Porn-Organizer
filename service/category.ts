import { useFetch } from 'usehooks-ts'

import { General } from '@interfaces'

import { createApi } from '@config'
const { baseURL } = createApi('/category')

export default {
  useCategories: () => useFetch<General[]>(baseURL)
}
