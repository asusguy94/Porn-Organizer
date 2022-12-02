import axios from 'axios'

import apiUrl from '@utils/client/api'
import { IWebsiteWithSites as IWebsite } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('website')
})

export default {
  getAll: async () => await api.get<IWebsite[]>('/')
}
