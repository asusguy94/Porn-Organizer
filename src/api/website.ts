import axios from 'axios'

import { server as serverConfig } from '@/config'
import { IWebsite } from '@/interfaces'

const api = axios.create({
	baseURL: `${serverConfig.api}/website`
})

export default {
	getAll: async <T = IWebsite>() => await api.get<T[]>('/')
}
