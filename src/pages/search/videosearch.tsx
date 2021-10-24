import React, { useState, useEffect } from 'react'

import {
	Box,
	Card,
	CardActionArea,
	CardMedia,
	Checkbox,
	FormControl,
	FormControlLabel,
	Grid,
	MenuItem,
	Radio,
	RadioGroup,
	Select,
	TextField,
	Typography
} from '@material-ui/core'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { daysToYears } from '@components/date/date'
import { handler as indeterminateHandler } from '@components/indeterminate/indeterminate'
import LabelCount from '@components/labelcount/labelcount'
import { getVisible } from '@components/search/helper'
import Ribbon from '@components/ribbon/ribbon'

import './search.scss'

import { server as serverConfig } from '@/config'

const VideoSearchPage = () => {
	const [videos, setVideos] = useState([])

	const [categories, setCategories] = useState([])
	const [attributes, setAttributes] = useState([])
	const [locations, setLocations] = useState([])
	const [websites, setWebsites] = useState([])

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
						website: false
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
					videoData={{ categories, attributes, locations, websites }}
					videos={videos}
					update={setVideos}
				/>
			</Grid>

			<Grid item xs={10}>
				<Videos videos={videos} />
			</Grid>

			<ScrollToTop smooth />
		</Grid>
	)
}

// Wrapper
const Videos = ({ videos }: any) => (
	<Box id='videos'>
		<Typography variant='h6' className='text-center'>
			<span className='count'>{getCount(videos)}</span> Videos
		</Typography>

		<Grid container justify='center'>
			{videos.length ? (
				videos.map((video: any) => {
					if (isHidden(video)) return null

					return <VideoCard video={video} key={video.id} />
				})
			) : (
				<Spinner />
			)}
		</Grid>
	</Box>
)

const VideoCard = ({ video }: any) => (
	<a href={`/video/${video.id}`}>
		<Card className='video ribbon-container'>
			<CardActionArea>
				<CardMedia component='img' src={`${serverConfig.source}/images/videos/${video.image}`} />

				<Grid container justifyContent='center' className='card__title card__title--fixed-height height-3'>
				<Typography className='text-center'>{video.name}</Typography>
				</Grid>

				<Ribbon label={daysToYears(video.ageInVideo)} />
			</CardActionArea>
		</Card>
	</a>
)

const Sidebar = ({ videoData, videos, update }: any) => (
	<>
		<TitleSearch videos={videos} update={update} />

		<Sort videos={videos} update={update} />

		<Filter videoData={videoData} videos={videos} update={update} />
	</>
)

const TitleSearch = ({ update, videos }: any) => {
	const callback = (e: any) => {
		const searchValue = e.currentTarget.value.toLowerCase()

		update(
			[...videos].map((video: any) => {
				video.hidden.titleSearch = !video.name.toLowerCase().includes(searchValue)

				return video
			})
		)
	}

	return <TextField autoFocus placeholder='Name' onChange={callback} />
}

// Container
const Sort = ({ videos, update }: any) => {
	const sortDefault = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAdded = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.id - b.id
				return reverse ? result * -1 : result
			})
		)
	}

	const sortDate = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const dateA: any = new Date(a.date)
				const dateB: any = new Date(b.date)

				const result = dateA - dateB
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAge = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.ageInVideo - b.ageInVideo
				return reverse ? result * -1 : result
			})
		)
	}

	const sortPlays = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
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

const Filter = ({ videoData, videos, update }: any) => {
	const website = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetLower = e.target.value.toLowerCase()

		update(
			[...videos].map((video: any) => {
				if (targetLower === 'all') {
					video.hidden.website = false
				} else {
					video.hidden.website = !(video.website?.toLowerCase() === targetLower)
				}

				return video
			})
		)
	}

	const category = (ref: any, target: any) => {
		const targetLower = target.name.toLowerCase()

		update(
			[...videos].map((video: any) => {
				if (ref.indeterminate) {
					const match = video.categories.some((category: any) => category.toLowerCase() === targetLower)

					if (match) {
						video.hidden.notCategory.push(targetLower)
					} else {
						// Remove checked-status from filtering
						video.hidden.category.splice(video.hidden.category.indexOf(targetLower), 1)
					}
				} else if (!ref.checked) {
					video.hidden.noCategory = false

					const match = video.categories.map((category: any) => category.toLowerCase()).includes(targetLower)

					if (match) {
						// Remove indeterminate-status from filtering
						video.hidden.notCategory.splice(video.hidden.notCategory.indexOf(targetLower), 1)
					}
				} else {
					const match = !video.categories.map((category: any) => category.toLowerCase()).includes(targetLower)

					if (match) video.hidden.category.push(targetLower)
				}

				return video
			})
		)
	}

	const attribute = (ref: any, target: any) => {
		const targetLower = target.name.toLowerCase()

		update(
			[...videos].map((video: any) => {
				if (ref.indeterminate) {
					const match = video.attributes.some((attribute: any) => attribute.toLowerCase() === targetLower)

					if (match) {
						video.hidden.notAttribute.push(targetLower)
					} else {
						// Remove checked-status from filtering
						video.hidden.attribute.splice(video.hidden.attribute.indexOf(targetLower), 1)
					}
				} else if (!ref.checked) {
					const match = video.attributes
						.map((attribute: any) => attribute.toLowerCase())
						.includes(targetLower)

					if (match) {
						// Remove indeterminate-status from filtering
						video.hidden.notAttribute.splice(video.hidden.notAttribute.indexOf(targetLower), 1)
					}
				} else {
					const match = !video.attributes
						.map((attribute: any) => attribute.toLowerCase())
						.includes(targetLower)

					if (match) video.hidden.attribute.push(targetLower)
				}

				return video
			})
		)
	}

	const location = (ref: any, target: any) => {
		const targetLower = target.name.toLowerCase()

		update(
			[...videos].map((video: any) => {
				if (ref.indeterminate) {
					const match = video.locations.some((location: any) => location.toLowerCase() === targetLower)

					if (match) {
						video.hidden.notLocation.push(targetLower)
					} else {
						// Remove checked-status from filtering
						video.hidden.location.splice(video.hidden.location.indexOf(targetLower), 1)
					}
				} else if (!ref.checked) {
					const match = video.locations.map((location: any) => location.toLowerCase()).includes(targetLower)

					if (match) {
						// Remove indeterminate-status from filtering
						video.hidden.notLocation.splice(video.hidden.notLocation.indexOf(targetLower), 1)
					}
				} else {
					const match = !video.locations.map((location: any) => location.toLowerCase()).includes(targetLower)

					if (match) video.hidden.location.push(targetLower)
				}

				return video
			})
		)
	}

	const category_NULL = (ref: any) => {
		update(
			[...videos].map((video: any) => {
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

	const category_POV = (ref: any) => {
		update(
			[...videos].map((video: any) => {
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
			<FilterDropdown data={videoData.websites} label='website' labelPlural='websites' callback={website} />

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

			<FilterObj
				data={videoData.attributes}
				obj={videos}
				label='attribute'
				labelPlural='attributes'
				callback={attribute}
			/>

			<FilterObj
				data={videoData.locations}
				obj={videos}
				label='location'
				labelPlural='locations'
				callback={location}
			/>
		</>
	)
}

// ContainerItem
const FilterObj = ({
	data,
	label,
	labelPlural,
	obj,
	callback,
	nullCallback = null,
	otherCallback = null,
	otherCallbackLabel = ''
}: any) => {
	return (
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
								{item.name} <LabelCount prop={labelPlural} label={item.name} obj={obj} />
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
}

const IndeterminateItem = ({ label, value, item = null, callback }: any) => {
	const [indeterminate, setIndeterminate] = useState(false)
	const [checked, setChecked] = useState(false)

	return (
		<FormControlLabel
			label={label}
			value={value}
			control={
				<Checkbox
					checked={checked}
					indeterminate={indeterminate}
					onChange={() => {
						const result = indeterminateHandler({ checked, indeterminate })

						setIndeterminate(result.indeterminate)
						setChecked(result.checked)

						callback(result, item)
					}}
				/>
			}
		/>
	)
}

const FilterDropdown = ({ data, label, labelPlural, callback }: any) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<FormControl>
			<Select id={label} name={labelPlural} defaultValue='ALL' onChange={callback}>
				<MenuItem value='ALL'>All</MenuItem>

				{data.map((item: any) => (
					<MenuItem key={item.id} value={item.name}>
						{item.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	</>
)

export default VideoSearchPage
