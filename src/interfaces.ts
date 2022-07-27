// Common Types
export type ISetState<T> = (input: T) => void

// Common Interfaces
export interface IGeneral {
	id: number
	name: string
}

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>
	}[Keys]

export type RequireOnlyOne<T, Keys extends keyof T = keyof T> = Pick<T, Exclude<keyof T, Keys>> &
	{
		[K in Keys]-?: Required<Pick<T, K>> & Partial<Record<Exclude<Keys, K>, undefined>>
	}[Keys]

export interface AxiosData<T> {
	data: T
}

export type IndexType<V> = {
	[key: string]: V
}

// Other Types
export type IQuality = 1080 | 720 | 480 | 360 | 0
export type ILevels = { [key: string]: number }
export type IAttribute = IGeneral
export type ILocation = IGeneral
export type ICategory = IGeneral
export type IWebsite = IGeneral
export type ICountryExtended = ICountry & IGeneral

// Other Interfaces
export interface IWebsiteWithSites extends IGeneral {
	sites: IGeneral[]
}

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
