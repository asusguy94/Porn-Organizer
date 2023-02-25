import { useFetch } from 'usehooks-ts'

import apiUrl from '@utils/client/api'
import { General } from '@interfaces'

const baseURL = apiUrl('category')

export default {
  useCategories: () => useFetch<General[]>(baseURL)
}
