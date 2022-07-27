import axios from 'axios'

import { server as serverConfig } from '@/config'
import { ICategory } from '@/interfaces'

const api = axios.create({
	baseURL: `${serverConfig.api}/category`
})

export default {
	getAll: async () => await api.get<ICategory[]>('/')
}
