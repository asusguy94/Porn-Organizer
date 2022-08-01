import React, { useState, useEffect, useRef } from 'react'

import {
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
	SelectChangeEvent,
	TextField,
	Typography
} from '@mui/material'

import KeyboardEventHandler from 'react-keyboard-event-handler'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { daysToYears } from '@/date'

import IndeterminateItem, { HandlerProps as IndeterminateItemProps } from '@components/indeterminate/indeterminate'
import LabelCount from '@components/labelcount/labelcount'
import { getVisible } from '@components/search/helper'
import Ribbon, { RibbonContainer } from '@components/ribbon/ribbon'
import VGrid from '@components/virtualized/virtuoso'
import Spinner from '@components/spinner/spinner'

import { attributeApi, categoryApi, locationApi, searchApi, websiteApi } from '@/api'

import {
	ICategory,
	IAttribute,
	ILocation,
	IQuality,
	ISetState,
	IWebsiteWithSites as IWebsite,
	IGeneral,
	IndexType
} from '@/interfaces'

import { server as serverConfig } from '@/config'

import styles from './video.module.scss'

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
	}
}

interface IVideoData {
	categories: ICategory[]
	attributes: IAttribute[]
	locations: ILocation[]
	websites: IWebsite[]
}

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
	}
}

interface IVideoData {
	categories: ICategory[]
	attributes: IAttribute[]
	locations: ILocation[]
	websites: IWebsite[]
}

const VideoSearchPage = () => {
	const [videos, setVideos] = useState<IVideo[]>([])

	const [categories, setCategories] = useState<ICategory[]>([])
	const [attributes, setAttributes] = useState<IAttribute[]>([])
	const [locations, setLocations] = useState<ILocation[]>([])
	const [websites, setWebsites] = useState<IWebsite[]>([])

	const inputRef = useRef<HTMLInputElement>()

	const handleKeyPress = (key: string, e: KeyboardEvent) => {
		e.preventDefault()

		switch (key) {
			case 'ctrl+f':
				inputRef.current?.focus()
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	useEffect(() => {
		loadVideos().then(() => {
			categoryApi.getAll().then(({ data }) => setCategories(data))
			attributeApi.getAll().then(({ data }) => setAttributes(data))
			locationApi.getAll().then(({ data }) => setLocations(data))
			websiteApi.getAll<IWebsite>().then(({ data }) => setWebsites(data))
		})
	}, [])

	const loadVideos = async () => {
		return searchApi.getVideos<IVideo[]>().then(({ data }) => {
			const websiteInfo: IndexType<number> = {
				Brazzers: 1035 + 1,
				Mofos: 201 + 1,
				SexyHub: 23 + 1
			}
			//+1 if finished!

			setVideos(
				data
					.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
					.filter((v) => v.website in websiteInfo && websiteInfo[v.website]-- > 1)
					.filter((v) => !v.attributes.includes('video-unplayable')) //FIXME broken file/stream?
					.map((video) => {
						return {
							...video,
							hidden: {
								category: [],
								notCategory: [],
								attribute: [],
								notAttribute: [],
								location: [],
								notLocation: [],
								titleSearch: false,
								noCategory: !(video.categories.length === 0),
								notNoCategory: false,
								pov: false,
								notPov: false,
								website: false
							}
						}
					})
			)
		})
	}

	return (
		<Grid container>
			<Grid item xs={2} id={styles.sidebar}>
				<Sidebar
					videoData={{ categories, attributes, locations, websites }}
					videos={videos}
					update={setVideos}
					inputRef={inputRef}
				/>
			</Grid>

			<Grid item xs={10}>
				<div className='text-center'>
					<Button variant='contained' onClick={loadVideos}>
						ReLoad
					</Button>
				</div>
				{videos.length ? <Videos videos={videos} /> : <Spinner />}
			</Grid>

			<ScrollToTop smooth />
			<KeyboardEventHandler handleKeys={['ctrl+f']} onKeyEvent={handleKeyPress} handleFocusableElements={true} />
		</Grid>
	)
}

interface VideosProps {
	videos: IVideo[]
}
const Videos = ({ videos }: VideosProps) => {
	const visibleVideos = getVisible(videos)

	return (
		<div id={styles.videos}>
			<Typography variant='h6' className='text-center'>
				<span id={styles.count}>{visibleVideos.length}</span> Videos
			</Typography>

			<VGrid
				itemHeight={300}
				total={visibleVideos.length}
				renderData={(idx) => <VideoCard video={visibleVideos[idx]} />}
			/>
		</div>
	)
}

interface VideoCardProps {
	video: IVideo
}
const VideoCard = ({ video }: VideoCardProps) => (
	<a href={`/video/${video.id}`}>
		<RibbonContainer component={Card} className={styles.video}>
			<CardActionArea>
				<CardMedia
					component='img'
					src={`${serverConfig.source}/video/${video.id}/thumb`}
					style={{ objectFit: 'inherit' }}
				/>

				<Grid container justifyContent='center' className={styles.title}>
					<Typography className='text-center'>{video.name}</Typography>
				</Grid>

				<Ribbon label={daysToYears(video.ageInVideo)} />
			</CardActionArea>
		</RibbonContainer>
	</a>
)

interface SidebarProps {
	videoData: IVideoData
	videos: IVideo[]
	update: ISetState<IVideo[]>
	inputRef: any
}
const Sidebar = ({ videoData, videos, update, inputRef }: SidebarProps) => (
	<>
		<TitleSearch videos={videos} update={update} inputRef={inputRef} />

		<Sort videos={videos} update={update} />

		<Filter videoData={videoData} videos={videos} update={update} />
	</>
)

interface TitleSearchProps {
	update: ISetState<IVideo[]>
	videos: IVideo[]
	inputRef: any
}
const TitleSearch = ({ update, videos, inputRef }: TitleSearchProps) => {
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

	return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} inputRef={inputRef} />
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

	const sortTitleLength = (reverse = false) => {
		update(
			[...videos].sort((a, b) => {
				const result = a.name.length - b.name.length
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

					<FormControlLabel
						label='Longest Title'
						value='title-len'
						control={<Radio />}
						onChange={() => sortTitleLength(true)}
					/>
					<FormControlLabel
						label='Shortest Title'
						value='title-len_desc'
						control={<Radio />}
						onChange={() => sortTitleLength()}
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
	const website = (e: SelectChangeEvent<string>) => {
		const websiteObj: IWebsite = JSON.parse(e.target.value)

		update(
			[...videos].map((video) => {
				if (websiteObj.name === 'ALL') {
					return { ...video, hidden: { ...video.hidden, website: false } }
				} else if (websiteObj.sites.length === 0) {
					return {
						...video,
						hidden: {
							...video.hidden,
							website: !(video.website.toLowerCase() === websiteObj.name.toLowerCase())
						}
					}
				} else {
					return {
						...video,
						hidden: {
							...video.hidden,
							website: !(video.site.toLowerCase() === websiteObj.sites[0].name.toLowerCase())
						}
					}
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
			<WebsiteDropdown websites={videoData.websites} label='website' callback={website} />

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
					label={<div className={styles.global}>NULL</div>}
					value='NULL'
					callback={(ref: any) => nullCallback(ref)}
				/>
			) : null}

			{otherCallback !== null ? (
				<IndeterminateItem
					label={<div className={styles.global}>{otherCallbackLabel.toUpperCase()}</div>}
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

interface WebsiteDropdownProps {
	websites: IWebsite[]
	label: string
	labelPlural?: string
	callback: (e: SelectChangeEvent<string>) => void
}
const WebsiteDropdown = ({ websites, label, labelPlural, callback }: WebsiteDropdownProps) => {
	const defaultValue = JSON.stringify({ name: 'ALL' })

	return (
		<>
			<h2>{capitalize(label, true)}</h2>

			<FormControl>
				<Select
					variant='standard'
					id={label}
					name={labelPlural ?? `${label}s`}
					defaultValue={defaultValue}
					onChange={callback}
				>
					<MenuItem value={defaultValue}>All</MenuItem>

					{websites.map((website) => [
						<MenuItem key={website.id.toString()} value={JSON.stringify({ ...website, sites: [] })}>
							{website.name}
						</MenuItem>,
						website.sites.map((site) => (
							<MenuItem
								key={`${website.id}-${site.id}`}
								value={JSON.stringify({
									...website,
									sites: [site]
								})}
							>
								{website.name} / {site.name}
							</MenuItem>
						))
					])}
				</Select>
			</FormControl>
		</>
	)
}

export default VideoSearchPage
