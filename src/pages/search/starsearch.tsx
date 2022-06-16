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
} from '@mui/material'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { daysToYears } from '@components/date/date'
import LabelCount from '@components/labelcount/labelcount'
import { getVisible } from '@components/search/helper'
import Ribbon from '@components/ribbon/ribbon'
import Badge from '@components/badge/badge'
import Loader from '@components/spinner/spinner'
import VGrid from '@components/virtualized/virtuoso'

import { AxiosData, ICountry, IGeneral, ISetState, IWebsite } from '@/interfaces'

import './search.scss'

import { server as serverConfig } from '@/config'

interface IStar extends IGeneral {
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
		website: boolean
		noBreast: boolean
	}
}

interface IStarData {
	breasts: string[]
	haircolors: string[]
	ethnicities: string[]
	countries: ICountry[]
	websites: IWebsite[]
}

const StarSearchPage = () => {
	const [stars, setStars] = useState<IStar[]>([])

	const [breasts, setBreasts] = useState<string[]>([])
	const [haircolors, setHaircolors] = useState<string[]>([])
	const [ethnicities, setEthnicities] = useState<string[]>([])
	const [countries, setCountries] = useState<ICountry[]>([])
	const [websites, setWebsites] = useState<IWebsite[]>([])

	useEffect(() => {
		Axios.get(`${serverConfig.api}/search/star`).then(({ data }: AxiosData<IStar[]>) => {
			setStars(
				data.map((star) => {
					return {
						...star,
						hidden: {
							titleSearch: false,

							breast: false,
							haircolor: false,
							ethnicity: false,
							country: false,
							website: false,

							noBreast: false
						}
					}
				})
			)
		})

		Axios.get(`${serverConfig.api}/star`).then(
			({
				data
			}: AxiosData<{ breast: string[]; haircolor: string[]; ethnicity: string[]; country: ICountry[] }>) => {
				setBreasts(data.breast)
				setHaircolors(data.haircolor)
				setEthnicities(data.ethnicity)
				setCountries(data.country)
			}
		)

		Axios.get(`${serverConfig.api}/website`).then(({ data }) => setWebsites(data))
	}, [])

	return (
		<Grid container id='search-page'>
			<Grid item xs={2}>
				<Sidebar
					starData={{ breasts, haircolors, ethnicities, countries, websites }}
					stars={stars}
					update={setStars}
				/>
			</Grid>

			<Grid item xs={10}>
				<Stars stars={stars} />
			</Grid>

			<ScrollToTop smooth />
		</Grid>
	)
}

interface StarsProps {
	stars: IStar[]
}
const Stars = ({ stars }: StarsProps) => {
	const visibleStars = getVisible(stars)

	return (
		<Box id='stars'>
			{stars.length ? (
				<>
					<Typography variant='h6' className='text-center'>
						<span className='count'>{visibleStars.length}</span> Stars
					</Typography>

					<VGrid
						itemHeight={309}
						total={visibleStars.length}
						renderData={(idx) => <StarCard star={visibleStars[idx]} />}
					/>
				</>
			) : (
				<Loader />
			)}
		</Box>
	)
}

interface StarCardProps {
	star: IStar
}
const StarCard = ({ star }: StarCardProps) => (
	<a href={`/star/${star.id}`}>
		<Card className='star ribbon-container'>
			<Badge content={star.videoCount}>
				<CardActionArea>
					<CardMedia component='img' src={`${serverConfig.source}/star/${star.id}`} />

					<Typography className='text-center'>{star.name}</Typography>

					<Ribbon label={daysToYears(star.age)} />
				</CardActionArea>
			</Badge>
		</Card>
	</a>
)

interface SidebarProps {
	starData: IStarData
	stars: IStar[]
	update: ISetState<IStar[]>
}
const Sidebar = ({ starData, stars, update }: SidebarProps) => (
	<>
		<TitleSearch stars={stars} update={update} />

		<Sort stars={stars} update={update} />

		<Filter starData={starData} stars={stars} update={update} />
	</>
)

interface FilterProps {
	stars: IStar[]
	starData: IStarData
	update: ISetState<IStar[]>
}
const Filter = ({ stars, starData, update }: FilterProps) => {
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

	const website_DROP = (e: React.ChangeEvent<HTMLInputElement>) => {
		const targetLower = e.target.value.toLowerCase()

		stars = stars.map((star) => {
			if (targetLower === 'all') {
				star.hidden.website = false
			} else {
				star.hidden.website = !star.websites.some((website) => website.toLowerCase() === targetLower)
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
			<FilterDropdown data={starData.websites} label='website' callback={website_DROP} />
			<FilterDropdown data={starData.countries} label='country' callback={country_DROP} />

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
		</>
	)
}

interface SortProps {
	stars: IStar[]
	update: ISetState<IStar[]>
}
const Sort = ({ stars, update }: SortProps) => {
	const sortDefault = (reverse = false) => {
		update(
			[...stars].sort((a, b) => {
				const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAdded = (reverse = false) => {
		update(
			[...stars].sort((a, b) => {
				const result = a.id - b.id
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAge = (reverse = false) => {
		update(
			[...stars].sort((a, b) => {
				const result = a.age - b.age
				return reverse ? result * -1 : result
			})
		)
	}

	const sortVideos = (reverse = false) => {
		update(
			[...stars].sort((a, b) => {
				const result = a.videoCount - b.videoCount
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

interface TitleSearchProps {
	stars: IStar[]
	update: ISetState<IStar[]>
}
const TitleSearch = ({ stars, update }: TitleSearchProps) => {
	const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.currentTarget.value.toLowerCase()

		update(
			stars.map((star) => ({
				...star,
				hidden: {
					...star.hidden,
					titleSearch: !star.name.toLowerCase().includes(searchValue)
				}
			}))
		)
	}

	// TODO search by alias, and change result-title to the alias name
	//! this might cause sort, methods to be broken
	//! should stars be sorted by the visible name?
	//! might cause flickering and difficulty to find a star by name

	return <TextField variant='standard' autoFocus placeholder='Name' onChange={callback} />
}

interface FilterItemProps {
	data: string[]
	label: string
	obj: IStar[]
	callback: any
	globalCallback?: (() => void) | null
	nullCallback?: any
}
const FilterItem = ({ data, label, obj, callback, globalCallback = null, nullCallback = null }: FilterItemProps) => (
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

interface FilterDropdownProps {
	data: IStarData['countries'] | IStarData['websites']
	label: string
	callback: (e: any) => void // TODO material-ui incompatible types
}
const FilterDropdown = ({ data, label, callback }: FilterDropdownProps) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<FormControl>
			<Select variant='standard' id={label} defaultValue='ALL' onChange={callback}>
				<MenuItem value='ALL'>All</MenuItem>
				{data.map((item) => {
					if ('code' in item) {
						return (
							<MenuItem key={item.code} value={item.name}>
								<i className={`flag flag-${item.code}`} style={{ marginRight: 4 }} /> {item.name}
							</MenuItem>
						)
					}

					return (
						<MenuItem key={item.name} value={item.name}>
							{item.name}
						</MenuItem>
					)
				})}
			</Select>
		</FormControl>
	</>
)

export default StarSearchPage
