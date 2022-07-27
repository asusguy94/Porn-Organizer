import axios from 'axios'

import { server as serverConfig } from '@/config'

const api = axios.create({
	baseURL: `${serverConfig.api}/search`
})

export default {
	getStars: async <T>() => await api.get<T>('/star'),
	getVideos: async <T>() => await api.get<T>('/video')
}
