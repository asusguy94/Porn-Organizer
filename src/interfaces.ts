// Common Types
export type ISetState<T> = (input: T) => void

// Common Interfaces
export interface IGeneral {
	id: number
	name: string
}

export interface AxiosData<T> {
	data: T
}

// Other Types
export type IQuality = 1080 | 720 | 480 | 360 | 0
export type ILevels = { [key: string]: number }

// Other Interfaces
export interface IAttribute extends IGeneral {}
export interface ILocation extends IGeneral {}
export interface ICategory extends IGeneral {}
export interface IWebsite extends IGeneral {}
export interface ISite extends IGeneral {}

export interface IBookmark {
	id: number
	category: {
		id: number
		name: string
	}
	start: number
}

export interface ICountry {
	code: string
	name: string
}

export type ICountryExtended = ICountry & IGeneral

export interface ISimilar {
	id: number
	name: string
	image: string
	match: number
}

export interface IVideo extends IGeneral {
	duration: number
	height?: number
	plays: number
	star: string
	website: string
	subsite: string
	locations: ILocation[]
	attributes: IAttribute[]
	date: { added: string; published: string }
	path: { file: string; stream: string; dash: string }
}

export interface IVideoStar extends IGeneral {
	image?: string
	ageInVideo: number
	numVideos: number
}

export interface IStarVideo extends IGeneral {
	image: string
	date: string
	fname: string
	website: string
	site: string
	age: number
	hidden: boolean
}
