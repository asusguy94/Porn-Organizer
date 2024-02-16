import axios from 'axios'

import { getRelativePath } from '@/utils/shared'

export default function createApi(suffix: string) {
  const baseURL = getRelativePath(`/api${suffix}`)

  return { api: axios.create({ baseURL }), baseURL }
}
