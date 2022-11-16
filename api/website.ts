import axios from 'axios'

import apiUrl from '@utils/client/api'
import { IGeneral } from '@interfaces'

const api = axios.create({
  baseURL: apiUrl('website')
})

export default {
  getAll: async <T = IGeneral>() => await api.get<T[]>('/')
}
