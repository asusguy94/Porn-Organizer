import React, { useState, useEffect } from 'react'

import {
	Box,
	Button,
	Card,
	CardActionArea,
	CardMedia,
	FormControl,
	FormControlLabel,
	Grid,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Typography
} from '@mui/material'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { daysToYears } from '@components/date/date'
import IndeterminateItem, { HandlerProps as IndeterminateItemProps } from '@components/indeterminate/indeterminate'
import LabelCount from '@components/labelcount/labelcount'
import { getVisible } from '@components/search/helper'
import Ribbon from '@components/ribbon/ribbon'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner/spinner'

import {
	ICategory,
	IAttribute,
	ILocation,
	IQuality,
	ISetState,
	IWebsite,
	ISite,
	IGeneral,
	AxiosData
} from '@/interfaces'

import './search.scss'

import { server as serverConfig } from '@/config'

interface IVideo extends IGeneral {
	ageInVideo: number
	attributes: string[]
	categories: string[]
	date: string
	image: string
	locations: string[]
	plays: number
	pov: boolean
	quality: IQuality
	site: string
	star: string
	website: string
	hidden: {
		category: string[]
		notCategory: string[]
		attribute: string[]
		notAttribute: string[]
		location: string[]
		notLocation: string[]
		titleSearch: boolean
		noCategory: boolean
		notNoCategory: boolean
		pov: boolean
		notPov: boolean
		website: boolean
		site: boolean
	}
}

interface IVideoData {
	categories: ICategory[]
	attributes: IAttribute[]
	locations: ILocation[]
	websites: IWebsite[]
	sites: ISite[]
}

const VideoSearchPage = () => {
	const [videos, setVideos] = useState<IVideo[]>([])

	const [categories, setCategories] = useState<ICategory[]>([])
	const [attributes, setAttributes] = useState<IAttribute[]>([])
	const [locations, setLocations] = useState<ILocation[]>([])
	const [websites, setWebsites] = useState<IWebsite[]>([])
	const [sites, setSites] = useState<ISite[]>([])

	useEffect(() => {
		Axios.get(`${serverConfig.api}/search/video`).then(({ data }) => {
			setVideos(
				data.filter((video: any) => {
					video.hidden = {
						category: [],
						notCategory: [],
						attribute: [],
						notAttribute: [],
						location: [],
						notLocation: [],
						titleSearch: false,
						noCategory: false,
						notNoCategory: false,
						pov: false,
						notPov: false,
						website: false,
                        site: false
					}

					if (video.quality === 0) return null

					return video
				})
			)

			Axios.get(`${serverConfig.api}/category`).then(({ data }) => setCategories(data))
			Axios.get(`${serverConfig.api}/attribute`).then(({ data }) => setAttributes(data))
			Axios.get(`${serverConfig.api}/location`).then(({ data }) => setLocations(data))
			Axios.get(`${serverConfig.api}/website`).then(({ data }) => setWebsites(data))
		})
	}, [])

	return (
		<Grid container id='search-page'>
			<Grid item xs={2}>
				<Sidebar
					videoData={{ categories, attributes, locations, websites, sites }}
					videos={videos}
					update={setVideos}
				/>
			</Grid>

			<Grid item xs={10}>
				{videos.length ? <Videos videos={videos} /> : <Spinner />}
			</Grid>

			<ScrollToTop smooth />
		</Grid>
	)
}

interface VideosProps {
	videos: IVideo[]
}
const Videos = ({ videos }: VideosProps) => {
	const visibleVideos = getVisible(videos)

	return (
		<Box id='videos'>
			<Typography variant='h6' className='text-center'>
				<span className='count'>{visibleVideos.length}</span> Videos
			</Typography>

			<VGrid
				itemHeight={300}
				total={visibleVideos.length}
				renderData={(idx) => <VideoCard video={visibleVideos[idx]} />}
			/>
		</Box>
	)
}

interface VideoCardProps {
	video: IVideo
}
const VideoCard = ({ video }: VideoCardProps) => (
	<a href={`/video/${video.id}`}>
		<Card className='video ribbon-container'>
			<CardActionArea>
				<CardMedia component='img' src={`${serverConfig.source}/video/${video.id}/thumb`} />

				<Grid container justifyContent='center' className='card__title card__title--fixed-height height-3'>
					<Typography className='text-center'>{video.name}</Typography>
				</Grid>

				<Ribbon label={daysToYears(video.ageInVideo)} />
			</CardActionArea>
		</Card>
	</a>
)

interface SidebarProps {
	videoData: IVideoData
	videos: IVideo[]
	update: ISetState<IVideo[]>
}
const Sidebar = ({ videoData, videos, update }: SidebarProps) => (
	<>
		<TitleSearch videos={videos} update={update} />

		<Sort videos={videos} update={update} />

		<Filter videoData={videoData} videos={videos} update={update} />
	</>
)

interface TitleSearchProps {
	update: ISetState<IVideo[]>
	videos: IVideo[]
}
const TitleSearch = ({ update, videos }: TitleSearchProps) => {
	const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.currentTarget.value.toLowerCase()

		update(
			[...videos].map((video) => ({
				...video,
				hidden: {
					...video.hidden,
					titleSearch: !video.name.toLowerCase().includes(searchValue)
				}
			}))
		)
	}

	return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} />
}

interface SortProps {
	videos: IVideo[]
	update: ISetState<IVideo[]>
}
const Sort = ({ videos, update }: SortProps) => {
	const sortDefault = (reverse = false) => {
		update(
			[...videos].sort((a, b) => {
				const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAdded = (reverse = false) => {
		update(
			[...videos].sort((a, b) => {
				const result = a.id - b.id
				return reverse ? result * -1 : result
			})
		)
	}

	const sortDate = (reverse = false) => {
		update(
			[...videos].sort((a, b) => {
				const dateA: Date = new Date(a.date)
				const dateB: Date = new Date(b.date)

				const result = dateA.getTime() - dateB.getTime()
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAge = (reverse = false) => {
		update(
			[...videos].sort((a, b) => {
				const result = a.ageInVideo - b.ageInVideo
				return reverse ? result * -1 : result
			})
		)
	}

	const sortPlays = (reverse = false) => {
		update(
			[...videos].sort((a, b) => {
				const result = a.plays - b.plays
				return reverse ? result * -1 : result
			})
		)
	}

	return (
		<>
			<h2>Sort</h2>
			<FormControl>
				<RadioGroup name='sort' defaultValue='alphabetically'>
					<FormControlLabel
						label='A-Z'
						value='alphabetically'
						control={<Radio />}
						onChange={() => sortDefault()}
					/>
					<FormControlLabel
						label='Z-A'
						value='alphabetically_desc'
						control={<Radio />}
						onChange={() => sortDefault(true)}
					/>

					<FormControlLabel
						label='Recent Upload'
						value='added_desc'
						control={<Radio />}
						onChange={() => sortAdded(true)}
					/>
					<FormControlLabel
						label='Old Upload'
						value='added'
						control={<Radio />}
						onChange={() => sortAdded()}
					/>

					<FormControlLabel
						label='Newest'
						value='date_desc'
						control={<Radio />}
						onChange={() => sortDate(true)}
					/>
					<FormControlLabel label='Oldest' value='date' control={<Radio />} onChange={() => sortDate()} />

					<FormControlLabel label='Teen' value='age' control={<Radio />} onChange={() => sortAge()} />
					<FormControlLabel
						label='Milf'
						value='age_desc'
						control={<Radio />}
						onChange={() => sortAge(true)}
					/>

					<FormControlLabel
						label='Most Popular'
						value='plays'
						control={<Radio />}
						onChange={() => sortPlays(true)}
					/>
					<FormControlLabel
						label='Least Popular'
						value='plays_desc'
						control={<Radio />}
						onChange={() => sortPlays()}
					/>
				</RadioGroup>
			</FormControl>
		</>
	)
}

interface FilterProps {
	videoData: IVideoData
	videos: IVideo[]
	update: ISetState<IVideo[]>
}
const Filter = ({ videoData, videos, update }: FilterProps) => {
	const website = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetLower = e.target.value.toLowerCase()

		update(
			[...videos].map((video) => {
				if (targetLower === 'all') {
					return { ...video, hidden: { ...video.hidden, website: false } }
				}

				return {
					...video,
					hidden: { ...video.hidden, website: !(video.website?.toLowerCase() === targetLower) }
				}
			})
		)
	}

	const site = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetLower = e.target.value.toLowerCase()

		update(
			[...videos].map((video) => {
				if (targetLower === 'all') {
					return { ...video, hidden: { ...video.hidden, site: false } }
				}

				return {
					...video,
					hidden: { ...video.hidden, site: !(video.site?.toLowerCase() === targetLower) }
				}
			})
		)
	}

	const category = (ref: IndeterminateItemProps, target: ICategory) => {
		const targetLower = target.name.toLowerCase()

		update(
			[...videos].map((video) => {
				if (ref.indeterminate) {
					const match = video.categories.some((category) => category.toLowerCase() === targetLower)

					if (match) {
						video.hidden.notCategory.push(targetLower)
					} else {
						// Remove checked-status from filtering
						video.hidden.category.splice(video.hidden.category.indexOf(targetLower), 1)
					}
				} else if (!ref.checked) {
					video.hidden.noCategory = false

					const match = video.categories.map((category) => category.toLowerCase()).includes(targetLower)

					if (match) {
						// Remove indeterminate-status from filtering
						video.hidden.notCategory.splice(video.hidden.notCategory.indexOf(targetLower), 1)
					}
				} else {
					const match = !video.categories.map((category) => category.toLowerCase()).includes(targetLower)

					if (match) video.hidden.category.push(targetLower)
				}

				return video
			})
		)
	}

	const attribute = (ref: IndeterminateItemProps, target: IAttribute) => {
		const targetLower = target.name.toLowerCase()

		update(
			[...videos].map((video) => {
				if (ref.indeterminate) {
					const match = video.attributes.some((attribute) => attribute.toLowerCase() === targetLower)

					if (match) {
						video.hidden.notAttribute.push(targetLower)
					} else {
						// Remove checked-status from filtering
						video.hidden.attribute.splice(video.hidden.attribute.indexOf(targetLower), 1)
					}
				} else if (!ref.checked) {
					const match = video.attributes.map((attribute) => attribute.toLowerCase()).includes(targetLower)

					if (match) {
						// Remove indeterminate-status from filtering
						video.hidden.notAttribute.splice(video.hidden.notAttribute.indexOf(targetLower), 1)
					}
				} else {
					const match = !video.attributes.map((attribute) => attribute.toLowerCase()).includes(targetLower)

					if (match) video.hidden.attribute.push(targetLower)
				}

				return video
			})
		)
	}

	const location = (ref: IndeterminateItemProps, target: ILocation) => {
		const targetLower = target.name.toLowerCase()

		update(
			[...videos].map((video) => {
				if (ref.indeterminate) {
					const match = video.locations.some((location) => location.toLowerCase() === targetLower)

					if (match) {
						video.hidden.notLocation.push(targetLower)
					} else {
						// Remove checked-status from filtering
						video.hidden.location.splice(video.hidden.location.indexOf(targetLower), 1)
					}
				} else if (!ref.checked) {
					const match = video.locations.map((location) => location.toLowerCase()).includes(targetLower)

					if (match) {
						// Remove indeterminate-status from filtering
						video.hidden.notLocation.splice(video.hidden.notLocation.indexOf(targetLower), 1)
					}
				} else {
					const match = !video.locations.map((location) => location.toLowerCase()).includes(targetLower)

					if (match) video.hidden.location.push(targetLower)
				}

				return video
			})
		)
	}

	const category_NULL = (ref: IndeterminateItemProps) => {
		update(
			[...videos].map((video) => {
				if (ref.indeterminate) {
					video.hidden.noCategory = false
					video.hidden.notNoCategory = video.categories.length === 0
				} else if (!ref.checked) {
					video.hidden.notNoCategory = false
				} else {
					video.hidden.noCategory = video.categories.length !== 0
				}

				return video
			})
		)
	}

	const category_POV = (ref: IndeterminateItemProps) => {
		update(
			[...videos].map((video) => {
				if (ref.indeterminate) {
					video.hidden.pov = false
					video.hidden.notPov = video.pov
				} else if (!ref.checked) {
					video.hidden.notPov = false
				} else {
					video.hidden.pov = !video.pov
				}

				return video
			})
		)
	}

	return (
		<>
			<FilterDropdown data={videoData.websites} label='website' callback={website} />
			<FilterDropdown data={videoData.sites} label='site' callback={site} />

			<FilterObj
				data={videoData.categories}
				obj={videos}
				label='category'
				labelPlural='categories'
				callback={category}
				nullCallback={category_NULL}
				otherCallback={category_POV}
				otherCallbackLabel='pov'
			/>

			<FilterObj data={videoData.attributes} obj={videos} label='attribute' callback={attribute} />

			<FilterObj data={videoData.locations} obj={videos} label='location' callback={location} />
		</>
	)
}

interface FilterObjProps {
	data: ICategory[] | IAttribute[] | ILocation[] | string[]
	label: string
	labelPlural?: string
	obj: IVideo[]
	callback: any
	nullCallback?: any
	otherCallback?: any
	otherCallbackLabel?: string
}
const FilterObj = ({
	data,
	label,
	labelPlural,
	obj,
	callback,
	nullCallback = null,
	otherCallback = null,
	otherCallbackLabel = ''
}: FilterObjProps) => (
		<>
			<h2>{capitalize(label, true)}</h2>

			<FormControl>
				{nullCallback !== null ? (
					<IndeterminateItem
						label={<div className='global-category'>NULL</div>}
						value='NULL'
						callback={(ref: any) => nullCallback(ref)}
					/>
				) : null}

				{otherCallback !== null ? (
					<IndeterminateItem
						label={<div className='global-category'>{otherCallbackLabel.toUpperCase()}</div>}
						value='OTHER'
						callback={(ref: any) => otherCallback(ref)}
					/>
				) : null}

				{data.map((item: any) => (
					<IndeterminateItem
						key={item.id}
						label={
							<>
							{item.name} <LabelCount prop={labelPlural ?? `${label}s`} label={item.name} obj={obj} />
							</>
						}
						value={item.name}
						item={item}
						callback={(ref: any, item: any) => callback(ref, item)}
					/>
				))}
			</FormControl>
		</>
	)

interface FilterDropdownProps {
	data: IGeneral[]
	label: string
	labelPlural?: string
	callback: any
}
const FilterDropdown = ({ data, label, labelPlural, callback }: FilterDropdownProps) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<FormControl>
			<Select
				variant='standard'
				id={label}
				name={labelPlural ?? `${label}s`}
				defaultValue='ALL'
				onChange={callback}
			>
				<MenuItem value='ALL'>All</MenuItem>

				{data.map((item) => (
					<MenuItem key={item.id} value={item.name}>
						{item.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	</>
)

export default VideoSearchPage
