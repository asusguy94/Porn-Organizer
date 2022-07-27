import axios from 'axios'

import { server as serverConfig } from '@/config'
import { IAttribute } from '@/interfaces'

const api = axios.create({
	baseURL: `${serverConfig.api}/attribute`
})

export default {
	getAll: async () => api.get<IAttribute[]>('/')
}
