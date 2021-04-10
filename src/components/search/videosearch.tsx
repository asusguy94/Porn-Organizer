import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { DaysToYears } from '../date/date'
import Indeterminate from '../indeterminate/indeterminate'
import LabelCount from '../labelcount/labelcount'
import { isHidden, getCount } from './helper'
import Spinner from '../spinner/spinner'

import './search.scss'

import config from '../config.json'

//TODO use children-prop instead of coded-children inside component

class VideoSearchPage extends Component {
	state = {
		videos: [],

		categories: [],
		attributes: [],
		locations: [],
		websites: []
	}

	componentDidMount() {
		Axios.get(`${config.api}/search/video`).then(({ data: videos }) => {
			this.setState(() => {
				videos = videos.map((video: any) => {
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

					video.pov = video.categories.length && video.categories.every((cat: any) => cat.includes('(POV)'))

					return video
				})

				return { videos }
			})
		})

		Axios.get(`${config.api}/category`).then(({ data: categories }) => this.setState({ categories }))
		Axios.get(`${config.api}/attribute`).then(({ data: attributes }) => this.setState({ attributes }))
		Axios.get(`${config.api}/location`).then(({ data: locations }) => this.setState({ locations }))
		Axios.get(`${config.api}/website`).then(({ data: websites }) => this.setState({ websites }))
	}

	render() {
		return (
			<div className='search-page col-12 row'>
				<Sidebar
					videoData={{
						categories: this.state.categories,
						attributes: this.state.attributes,
						locations: this.state.locations,
						website: this.state.websites
					}}
					videos={this.state.videos}
					update={(videos: any) => this.setState({ videos })}
				/>

				<Videos videos={this.state.videos} />

				<ScrollToTop smooth />
			</div>
		)
	}
}

// Wrapper
const Videos = ({ videos }: any) => (
	<section id='videos' className='col-10'>
		<h2 className='text-center'>
			<span className='count'>{getCount(videos)}</span> Videos
		</h2>

		<div className='row justify-content-center'>
			{videos.length ? (
				videos.map((video: any) => (
					<a
						key={video.id}
						className={`video ribbon-container card ${isHidden(video) ? 'd-none' : ''}`}
						href={`/video/${video.id}`}
					>
						<img
							className='card-img-top'
							src={`${config.source}/images/videos/${video.image}`}
							alt='video'
						/>

						<span className='title card-title text-center px-1'>{video.name}</span>

						<span className='ribbon'>
							<DaysToYears days={video.ageInVideo} />
						</span>
					</a>
				))
			) : (
				<Spinner />
			)}
		</div>
	</section>
)

const Sidebar = ({ videoData, videos, update }: any) => (
	<aside className='col-2'>
		<TitleSearch videos={videos} update={update} />

		<Sort videos={videos} update={update} />
		<Filter videoData={videoData} videos={videos} update={update} />
	</aside>
)

const TitleSearch = ({ update, videos }: any) => {
	const callback = (e: any) => {
		const searchValue = e.target.value.toLowerCase()

		videos = videos.map((video: any) => {
			video.hidden.titleSearch = !video.name.toLowerCase().includes(searchValue)

			return video
		})

		update(videos)
	}

	return (
		<div className='input-wrapper'>
			<input type='text' placeholder='Name' autoFocus onChange={callback} />
		</div>
	)
}

// Container
const Sort = ({ videos, update }: any) => {
	const sortDefault = (reverse = false) => {
		videos.sort((a: any, b: any) => {
			let valA = a.name.toLowerCase()
			let valB = b.name.toLowerCase()

			return valA.localeCompare(valB, 'en')
		})

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortAdded = (reverse = false) => {
		videos.sort((a: any, b: any) => a.id - b.id)

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortDate = (reverse = false) => {
		videos.sort((a: any, b: any) => {
			const dateA: any = new Date(a.date)
			const dateB: any = new Date(b.date)

			return dateA - dateB
		})

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortAge = (reverse = false) => {
		videos.sort((a: any, b: any) => a.ageInVideo - b.ageInVideo)

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortPlays = (reverse = false) => {
		videos.sort((a: any, b: any) => a.plays - b.plays)

		if (reverse) videos.reverse()
		update(videos)
	}

	return (
		<>
			<h2>Sort</h2>

			<SortItem name='A-Z' label='alphabetically' callback={() => sortDefault()} checked={true} />
			<SortItem name='Z-A' label='alphabetically_desc' callback={() => sortDefault(true)} />

			<SortItem name='Recent Upload' label='added_desc' callback={() => sortAdded(true)} />
			<SortItem name='Old Upload' label='added' callback={() => sortAdded()} />

			<SortItem name='Newest' label='date_desc' callback={() => sortDate(true)} />
			<SortItem name='Oldest' label='date' callback={() => sortDate()} />

			<SortItem name='Teen' label='age' callback={() => sortAge()} />
			<SortItem name='Milf' label='age_desc' callback={() => sortAge(true)} />

			<SortItem name='Most Popular' label='plays' callback={() => sortPlays(true)} />
			<SortItem name='Least Popular' label='plays_desc' callback={() => sortPlays()} />
		</>
	)
}

const Filter = ({ videoData, videos, update }: any) => {
	const website = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetLower = e.currentTarget.value.toLowerCase()

		videos = videos.map((video: any) => {
			if (targetLower === 'all') {
				video.hidden.website = false
			} else {
				video.hidden.website = !(video.website?.toLowerCase() === targetLower)
			}

			return video
		})

		update(videos)
	}

	const category = (e: React.ChangeEvent<HTMLInputElement>, target: any) => {
		const targetLower = target.name.toLowerCase()

		videos = videos.map((video: any) => {
			if (e.currentTarget.indeterminate) {
				const match = video.categories.some((category: any) => category.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notCategory.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.category.splice(video.hidden.category.indexOf(targetLower), 1)
				}
			} else if (!e.currentTarget.checked) {
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

		update(videos)
	}

	const attribute = (e: React.ChangeEvent<HTMLInputElement>, target: any) => {
		const targetLower = target.name.toLowerCase()

		videos = videos.map((video: any) => {
			if (e.currentTarget.indeterminate) {
				const match = video.attributes.some((attribute: any) => attribute.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notAttribute.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.attribute.splice(video.hidden.attribute.indexOf(targetLower), 1)
				}
			} else if (!e.currentTarget.checked) {
				const match = video.attributes.map((attribute: any) => attribute.toLowerCase()).includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					video.hidden.notAttribute.splice(video.hidden.notAttribute.indexOf(targetLower), 1)
				}
			} else {
				const match = !video.attributes.map((attribute: any) => attribute.toLowerCase()).includes(targetLower)

				if (match) video.hidden.attribute.push(targetLower)
			}

			return video
		})

		update(videos)
	}

	const location = (e: React.ChangeEvent<HTMLInputElement>, target: any) => {
		const targetLower = target.name.toLowerCase()

		videos = videos.map((video: any) => {
			if (e.currentTarget.indeterminate) {
				const match = video.locations.some((location: any) => location.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notLocation.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.location.splice(video.hidden.location.indexOf(targetLower), 1)
				}
			} else if (!e.currentTarget.checked) {
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

		update(videos)
	}

	const category_NULL = (e: React.ChangeEvent<HTMLInputElement>) => {
		videos = videos.map((video: any) => {
			if (e.currentTarget.indeterminate) {
				video.hidden.noCategory = false
				video.hidden.notNoCategory = video.categories.length === 0
			} else if (!e.currentTarget.checked) {
				video.hidden.notNoCategory = false
			} else {
				video.hidden.noCategory = video.categories.length !== 0
			}

			return video
		})

		update(videos)
	}

	const category_POV = (e: React.ChangeEvent<HTMLInputElement>) => {
		videos = videos.map((video: any) => {
			if (e.currentTarget.indeterminate) {
				video.hidden.pov = false
				video.hidden.notPov = false
			} else if (!e.currentTarget.checked) {
				video.hidden.notPov = false
			} else {
				video.hidden.pov = !video.hidden.pov
			}

			return video
		})

		update(videos)
	}

	return (
		<>
			<FilterDropdown data={videoData.website} label='website' labelPlural='websites' callback={website} />

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
const SortItem = ({ callback, label, name, checked = false, disabled = false }: any) => (
	<div className={`input-wrapper ${disabled ? 'disabled' : ''}`}>
		<input type='radio' name='sort' id={label} onChange={callback} defaultChecked={checked} />
		<label htmlFor={label}>{name}</label>
	</div>
)

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
	const indeterminate = new Indeterminate()

	return (
		<>
			<h2>{capitalize(label, true)}</h2>

			<div id={label}>
				{nullCallback !== null ? (
					<div className='input-wrapper'>
						<input
							type='checkbox'
							name={label}
							id={`${label}_NULL`}
							onChange={(e) => {
								indeterminate.handleIndeterminate(e)
								nullCallback(e)
							}}
						/>
						<label className='global-category' htmlFor={`${label}_NULL`}>
							NULL
						</label>
					</div>
				) : null}

				{otherCallback !== null ? (
					<div className='input-wrapper'>
						<input
							type='checkbox'
							name={label}
							id={`${label}_OTHER`}
							onChange={(e) => {
								indeterminate.handleIndeterminate(e)
								nullCallback(e)
							}}
						/>
						<label className='global-category' htmlFor={`${label}_OTHER`}>
							{otherCallbackLabel.toUpperCase()}
						</label>
					</div>
				) : null}

				{data.map((item: any) => (
					<div className='input-wrapper' key={item.id}>
						<input
							type='checkbox'
							name={label}
							id={`${label}-${item.name}`}
							onChange={(e) => {
								indeterminate.handleIndeterminate(e)
								callback(e, item)
							}}
						/>
						<label htmlFor={`${label}-${item.name}`}>
							{item.name} <LabelCount prop={labelPlural} label={item.name} obj={obj} />
						</label>
					</div>
				))}
			</div>
		</>
	)
}

const FilterDropdown = ({ data, label, labelPlural, callback }: any) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<div className='input-wrapper'>
			<select className='form-select' name={labelPlural} onChange={callback}>
				<option selected>All</option>

				{data.map((item: any) => (
					<option key={item.id}>{item.name}</option>
				))}
			</select>
		</div>
	</>
)

export default VideoSearchPage
