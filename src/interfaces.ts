import React from 'react'

export interface IAttribute {
	id: number
	name: string
}

export interface ILocation {
	id: number
	name: string
}

export interface ICategory {
	id: number
	name: string
}

export interface IBookmark {
	id: number
	name: string
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

export interface IModal {
	title: string | null
	data: any
	filter?: boolean
	visible: boolean
}

export interface IInput {
	edit: boolean
	value: null | string
}

export interface IVideo {
	id: number
	name: string
	duration: number
	height?: number
	nextID: number | null
	plays: number
	star: string
	website: string
	subsite: string
	locations: ILocation[]
	attributes: IAttribute[]
	date: { added: string; published: string }
	path: { file: string; stream: string; dash: string }
}

export interface IVideoStar {
	id: number
	name: string
	image?: string
	ageInVideo: number
	numVideos: number
}

export interface IKeyPress extends React.KeyboardEvent {
	target: HTMLInputElement
}
