import axios from 'axios'

import { server as serverConfig } from '@/config'
import { IAttribute, ILocation, IVideoStar } from '@/interfaces'

const api = axios.create({
	baseURL: `${serverConfig.api}/video`
})

export default {
	getVideo: async <T>(id: number) => await api.get<T>(`/${id}`),
	getBookmarks: async <T>(id: number) => await api.get<T>(`/${id}/bookmark`),
	getStar: async <T>(id: number) => await api.get<T>(`/${id}/star`),
	addStar: async (id: number, star: string) => await api.post<IVideoStar>(`/${id}/star`, { name: star }),
	removeStar: async (id: number) => await api.delete(`/${id}/star`),
	addLocation: async (id: number, locationID: number) => {
		return await api.post<ILocation>(`/${id}/location`, { locationID })
	},
	addAttribute: async (id: number, attributeID: number) => {
		return await api.post<IAttribute>(`/${id}/attribute`, { attributeID })
	},
	fixDate: async <T>(id: number) => await api.put<T>(`/${id}/fixDate`, { date: true }),
	renameTitle: async (id: number, title: string) => await api.put(`/${id}`, { title }),
	addPlay: async (id: number) => await api.put(`/${id}`, { plays: 1 })
}
