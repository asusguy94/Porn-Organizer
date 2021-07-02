import React, { useState, useEffect } from 'react'

import {
	Grid,
	Card,
	CardMedia,
	CardActionArea,
	Box,
	Typography,
	TextField,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	Select,
	MenuItem
} from '@material-ui/core'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { daysToYears } from '../date/date'
import LabelCount from '../labelcount/labelcount'
import { getCount, isHidden } from './helper'
import Spinner from '../spinner/spinner'
import Ribbon from '../ribbon/ribbon'
import Badge from '../badge/badge'

import './search.scss'

import config from '../config.json'

//TODO use children-prop instead of coded-children inside component

interface IStar {
	id: number
	name: string
	image: string
	age: number
	breast: string
	country: string
	ethnicity: string
	eyecolor: string
	haircolor: string
	websites: string[]
	sites: string[]
	videoCount: number
	hidden: {
		titleSearch: boolean
		breast: boolean
		haircolor: boolean
		ethnicity: boolean
		country: boolean
		noBreast: boolean
	}
}

const StarSearchPage = () => {
	const [stars, setStars] = useState([])

	const [breasts, setBreasts] = useState([])
	const [haircolors, setHaircolors] = useState([])
	const [ethnicities, setEthnicities] = useState([])
	const [countries, setCountries] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/search/star`).then(({ data }) => {
			setStars(
				data.map((star: IStar) => {
					star.hidden = {
						titleSearch: false,

						breast: false,
						haircolor: false,
						ethnicity: false,
						country: false,

						noBreast: false
					}

					return star
				})
			)
		})

		Axios.get(`${config.api}/star`).then(({ data }) => {
			setBreasts(data.breast)
			setHaircolors(data.haircolor)
			setEthnicities(data.ethnicity)
			setCountries(data.country)
			})
	}, [])

		return (
			<Grid container id='search-page'>
				<Grid item xs={2}>
				<Sidebar starData={{ breasts, haircolors, ethnicities, countries }} stars={stars} update={setStars} />
				</Grid>

				<Grid item container xs={10} justify='center'>
				<Stars stars={stars} />
				</Grid>

				<ScrollToTop smooth />
			</Grid>
		)
	}

// Wrapper
const Stars = ({ stars }: { stars: IStar[] }) => (
	<Box id='stars'>
		<Typography variant='h6' className='text-center'>
			<span className='count'>{getCount(stars)}</span> Stars
		</Typography>

		<Grid container justify='center'>
			{stars.length ? (
				stars.map((star) => {
					if (isHidden(star)) return null

					return <StarCard key={star.id} star={star} />
				})
			) : (
				<Spinner />
			)}
		</Grid>
	</Box>
)

const StarCard = ({ star }: any) => (
	<a href={`/star/${star.id}`}>
		<Card className='star ribbon-container'>
			<Badge content={star.videoCount}>
			<CardActionArea>
				<CardMedia component='img' src={`${config.source}/images/stars/${star.image}`} />

				<Typography className='text-center'>{star.name}</Typography>

				<Ribbon label={daysToYears(star.age)} />
			</CardActionArea>
			</Badge>
		</Card>
	</a>
)

interface ISidebar {
	starData: any
	stars: IStar[]
	update: any
}
const Sidebar = ({ starData, stars, update }: ISidebar) => (
	<>
		<TitleSearch stars={stars} update={update} />

		<Sort stars={stars} update={update} />

		<Filter starData={starData} stars={stars} update={update} />
	</>
)

// Container
interface IFilter {
	stars: IStar[]
	starData: any
	update: any
}
const Filter = ({ stars, starData, update }: IFilter) => {
	const breast = (target: string) => {
		stars = stars.map((star) => {
			star.hidden.noBreast = false
			star.hidden.breast = star.breast.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const haircolor = (target: string) => {
		stars = stars.map((star) => {
			star.hidden.haircolor = star.haircolor.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const ethnicity = (target: string) => {
		stars = stars.map((star) => {
			star.hidden.ethnicity = star.ethnicity.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const country_DROP = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetLower = e.target.value.toLowerCase()

		stars = stars.map((star) => {
			if (targetLower === 'all') {
				star.hidden.country = false
			} else {
				star.hidden.country = star.country.toLowerCase() !== targetLower
			}

			return star
		})

		update(stars)
	}

	const breast_NULL = (e: React.ChangeEvent<HTMLFormElement>) => {
		stars = stars.map((star) => {
			star.hidden.noBreast = e.currentTarget.checked && star.breast.length
			star.hidden.breast = false

			return star
		})

		update(stars)
	}

	const breast_ALL = () => {
		stars = stars.map((star) => {
			star.hidden.breast = false
			star.hidden.noBreast = false

			return star
		})

		update(stars)
	}

	const haircolor_ALL = () => {
		stars = stars.map((star) => {
			star.hidden.haircolor = false

			return star
		})

		update(stars)
	}

	const ethnicity_ALL = () => {
		stars = stars.map((star) => {
			star.hidden.ethnicity = false

			return star
		})

		update(stars)
	}

	return (
		<>
			<FilterItem
				data={starData.breasts}
				obj={stars}
				label='breast'
				callback={breast}
				globalCallback={breast_ALL}
				nullCallback={breast_NULL}
			/>

			<FilterItem
				data={starData.haircolors}
				obj={stars}
				label='haircolor'
				callback={haircolor}
				globalCallback={haircolor_ALL}
			/>

			<FilterItem
				data={starData.ethnicities}
				obj={stars}
				label='ethnicity'
				callback={ethnicity}
				globalCallback={ethnicity_ALL}
			/>

			<FilterDropdown data={starData.countries} label='country' callback={country_DROP} />
		</>
	)
}

interface ISort {
	stars: IStar[]
	update: any
}
const Sort = ({ stars, update }: ISort) => {
	const sortDefault = (reverse = false) => {
		stars.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en'))

		if (reverse) stars.reverse()
		update(stars)
	}

	const sortAdded = (reverse = false) => {
		stars.sort((a, b) => a.id - b.id)

		if (reverse) stars.reverse()
		update(stars)
	}

	const sortAge = (reverse = false) => {
		stars.sort((a, b) => a.age - b.age)

		if (reverse) stars.reverse()
		update(stars)
	}

	const sortVideos = (reverse = false) => {
		stars.sort((a, b) => a.videoCount - b.videoCount)

		if (reverse) stars.reverse()
		update(stars)
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
						label='Old Upload'
						value='added'
						control={<Radio />}
						onChange={() => sortAdded()}
					/>
					<FormControlLabel
						label='Recent Upload'
						value='added_desc'
						control={<Radio />}
						onChange={() => sortAdded(true)}
					/>

					<FormControlLabel label='Teen' value='star-age' control={<Radio />} onChange={() => sortAge()} />
					<FormControlLabel
						label='Milf'
						value='star-age_desc'
						control={<Radio />}
						onChange={() => sortAge(true)}
					/>

					<FormControlLabel
						label='Least Videos'
						value='videos'
						control={<Radio />}
						onChange={() => sortVideos()}
					/>
					<FormControlLabel
						label='Most Videos'
						value='videos_desc'
						control={<Radio />}
						onChange={() => sortVideos(true)}
					/>
				</RadioGroup>
			</FormControl>
		</>
	)
}

interface ITitleSearch {
	stars: IStar[]
	update: any
}
const TitleSearch = ({ stars, update }: ITitleSearch) => {
	const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.currentTarget.value.toLowerCase()

		update(
			stars.map((item) => {
			item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

			return item
		})
		)
	}

	return <TextField autoFocus placeholder='Name' onChange={callback} />
}

// ContainerItem
interface IFilterItem {
	data: any[]
	label: string
	obj: any
	callback: any
	globalCallback?: any
	nullCallback?: any
}
const FilterItem = ({ data, label, obj, callback, globalCallback = null, nullCallback = null }: IFilterItem) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<FormControl>
			<RadioGroup name={label} defaultValue='ALL'>
				{globalCallback !== null ? (
					<FormControlLabel
						value='ALL'
						label={<div className='global-category'>ALL</div>}
						onChange={globalCallback}
						control={<Radio />}
					/>
				) : null}

				{nullCallback !== null ? (
					<FormControlLabel
						value='NULL'
						label={<div className='global-category'>NULL</div>}
						onChange={nullCallback}
						control={<Radio />}
					/>
				) : null}

				{data.map((item) => (
					<FormControlLabel
						key={item}
						value={item}
						onChange={() => callback(item)}
						label={
							<>
								{item} <LabelCount prop={label} label={item} obj={obj} isArr />
							</>
						}
						control={<Radio />}
					/>
				))}
			</RadioGroup>
		</FormControl>
	</>
)

interface IFilterDropdown {
	data: any[]
	label: string
	callback: any
}
const FilterDropdown = ({ data, label, callback }: IFilterDropdown) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<FormControl>
			<Select id={label} defaultValue='ALL' onChange={callback}>
				<MenuItem value='ALL'>All</MenuItem>
				{data.map((item: { code: string; name: string }) => (
					<MenuItem key={item.code} value={item.name}>
						<i className={`flag flag-${item.code}`} style={{ marginRight: 4 }} /> {item.name}
					</MenuItem>
				))}
			</Select>
		</FormControl>
	</>
)

export default StarSearchPage
