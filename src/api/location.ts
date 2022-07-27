import axios from 'axios'

import { server as serverConfig } from '@/config'
import { ILocation } from '@/interfaces'

const api = axios.create({
	baseURL: `${serverConfig.api}/location`
})

export default {
	getAll: async () => await api.get<ILocation[]>('/')
}
