import axios from 'axios'

import { ICountry, IStarVideo } from '@/interfaces'
import { server as serverConfig } from '@/config'

const api = axios.create({
	baseURL: `${serverConfig.api}/star`
})

export default {
	getInfo: async () => {
		interface IStarInfo {
			breast: string[]
			eyecolor: string[]
			haircolor: string[]
			ethnicity: string[]
			country: ICountry[]
		}

		return await api.get<IStarInfo>('/')
	},
	getMissing: async <M, S>() => await api.get<{ missing: M[]; stars: S[] }>('/missing'),
	addStar: async (star: string) => await api.post('/', { name: star }),
	getStar: async <T>(id: number) => await api.get<T>(`/${id}`),
	removeStar: async (id: number) => await api.delete(`/${id}`),
	getVideos: async (id: number) => await api.get<IStarVideo[]>(`/${id}/video`),
	renameStar: async (id: number, name: string) => await api.put(`/${id}`, { name }),
	ignoreStar: async <T extends { id: number; ignored: boolean }>(star: T) => {
		return await api.put<T & { autoTaggerIgnore: boolean }>(`/${star.id}`, { ignore: !star.ignored })
	},
	addAlias: async (id: number, alias: string) => await api.post(`/${id}/alias`, { alias })
}
