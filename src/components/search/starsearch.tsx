import { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { DaysToYears } from '../date/date'
import LabelCount from '../labelcount/labelcount'
import { getCount, isHidden } from './helper'
import Spinner from '../spinner/spinner'

import './search.scss'

import config from '../config.json'

//TODO use children-prop instead of coded-children inside component

class StarSearchPage extends Component {
	state = {
		stars: [],

		breasts: [],
		haircolors: [],
		ethnicities: [],
		countries: []
	}

	componentDidMount() {
		// Stars
		Axios.get(`${config.api}/search/star`).then(({ data: stars }) => {
			this.setState(() => {
				stars = stars.map((star: any) => {
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

				return { stars }
			})
		})

		// starData
		Axios.get(`${config.api}/star`).then(({ data }) => {
			this.setState({
				breasts: data.breast,
				haircolors: data.haircolor,
				ethnicities: data.ethnicity,
				countries: data.country
			})
		})
	}

	render() {
		return (
			<div className='search-page col-12 row'>
				<Sidebar
					starData={{
						breasts: this.state.breasts,
						haircolors: this.state.haircolors,
						ethnicities: this.state.ethnicities,
						countries: this.state.countries
					}}
					stars={this.state.stars}
					update={(stars: any) => this.setState({ stars })}
				/>

				<Stars stars={this.state.stars} />

				<ScrollToTop smooth />
			</div>
		)
	}
}

// Wrapper
const Stars = ({ stars }: any) => (
	<section id='stars' className='col-10'>
		<h2 className='text-center'>
			<span className='count'>{getCount(stars)}</span> Stars
		</h2>

		<div className='row justify-content-center'>
			{stars.length ? (
				stars.map((star: any) => (
					<a
						key={star.id}
						href={`/star/${star.id}`}
						className={`star ribbon-container card ${isHidden(star) ? 'd-none' : ''}`}
					>
						<img className='card-img-top' src={`${config.source}/images/stars/${star.image}`} alt='star' />

						<span className='title card-title text-center'>{star.name}</span>

						<span className='ribbon'>
							<DaysToYears days={star.age} />
						</span>
					</a>
				))
			) : (
				<Spinner />
			)}
		</div>
	</section>
)

const Sidebar = ({ starData, stars, update }: any) => (
	<aside className='col-2'>
		<TitleSearch stars={stars} update={update} />

		<Sort stars={stars} update={update} />

		<Filter starData={starData} stars={stars} update={update} />
	</aside>
)

// Container
const Filter = ({ stars, starData, update }: any) => {
	const breast = (target: any) => {
		stars = stars.map((star: any) => {
			star.hidden.noBreast = false
			star.hidden.breast = star.breast.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const haircolor = (target: any) => {
		stars = stars.map((star: any) => {
			star.hidden.haircolor = star.haircolor.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const ethnicity = (target: any) => {
		stars = stars.map((star: any) => {
			star.hidden.ethnicity = star.ethnicity.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const country_DROP = (e: any) => {
		const targetLower = e.target.value.toLowerCase()

		stars = stars.map((star: any) => {
			if (targetLower === 'all') {
				star.hidden.country = false
			} else {
				star.hidden.country = star.country.toLowerCase() !== targetLower
			}

			return star
		})

		update(stars)
	}

	const breast_NULL = (e: any) => {
		stars = stars.map((star: any) => {
			star.hidden.noBreast = e.target.checked && star.breast.length
			star.hidden.breast = false

			return star
		})

		update(stars)
	}

	const breast_ALL = () => {
		stars = stars.map((star: any) => {
			star.hidden.breast = false
			star.hidden.noBreast = false

			return star
		})

		update(stars)
	}

	const haircolor_ALL = () => {
		stars = stars.map((star: any) => {
			star.hidden.haircolor = false

			return star
		})

		update(stars)
	}

	const ethnicity_ALL = () => {
		stars = stars.map((star: any) => {
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

			<FilterDropdown data={starData.countries} label='country' labelPlural='countries' callback={country_DROP} />
		</>
	)
}

const Sort = ({ stars, update }: any) => {
	const sortDefault = (reverse = false) => {
		stars.sort((a: any, b: any) => {
			let valA = a.name.toLowerCase()
			let valB = b.name.toLowerCase()

			return valA.localeCompare(valB, 'en')
		})

		if (reverse) stars.reverse()
		update(stars)
	}

	const sortAdded = (reverse = false) => {}

	const sortAge = (reverse = false) => {
		stars.sort((a: any, b: any) => a.age - b.age)

		if (reverse) stars.reverse()
		update(stars)
	}

	const sortVideos = (reverse = false) => {
		stars.sort((a: any, b: any) => a.videoCount - b.videoCount)

		if (reverse) stars.reverse()
		update(stars)
	}

	return (
		<>
			<h2>Sort</h2>

			<SortItem name='A-Z' label='alphabetically' callback={() => sortDefault()} checked={true} />
			<SortItem name='Z-A' label='alphabetically_desc' callback={() => sortDefault(true)} />

			<SortItem name='Old Upload' label='added' callback={() => sortAdded()} disabled={true} />
			<SortItem name='Recent Upload' label='added_desc' callback={() => sortAdded(true)} disabled={true} />

			<SortItem name='Teen' label='star-age' callback={() => sortAge()} />
			<SortItem name='Milf' label='star-age_desc' callback={() => sortAge(true)} />

			<SortItem name='Least Videos' label='videos' callback={() => sortVideos()} />
			<SortItem name='Most Videos' label='videos_desc' callback={() => sortVideos(true)} />
		</>
	)
}

const TitleSearch = ({ stars, update }: any) => {
	const callback = (e: any) => {
		const searchValue = e.target.value.toLowerCase()

		stars = stars.map((item: any) => {
			item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

			return item
		})

		update(stars)
	}

	return (
		<div className='input-wrapper'>
			<input type='text' placeholder='Name' autoFocus onChange={callback} />
		</div>
	)
}

// ContainerItem
const SortItem = ({ callback, label, name, checked = false, disabled = false }: any) => (
	<div className={`input-wrapper ${disabled ? 'disabled' : ''}`}>
		<input type='radio' name='sort' id={label} onChange={callback} defaultChecked={checked} />
		<label htmlFor={label}>{name}</label>
	</div>
)

const FilterItem = ({ data, label, obj, callback, globalCallback = null, nullCallback = null }: any) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<div id={label}>
			{globalCallback !== null ? (
				<div className='input-wrapper'>
					<input
						type='radio'
						name={label}
						id={`${label}_ALL`}
						onChange={() => globalCallback()}
						defaultChecked
					/>
					<label className='global-category' htmlFor={`${label}_ALL`}>
						ALL
					</label>
				</div>
			) : null}

			{nullCallback !== null ? (
				<div className='input-wrapper'>
					<input type='radio' name={label} id={`${label}_NULL`} onChange={(e) => nullCallback(e)} />
					<label className='global-category' htmlFor={`${label}_NULL`}>
						NULL
					</label>
				</div>
			) : null}

			{data.map((item: any) => (
				<div className='input-wrapper' key={item}>
					<input type='radio' name={label} id={`${label}-${item}`} onChange={() => callback(item)} />
					<label htmlFor={`${label}-${item}`}>
						{item} <LabelCount prop={label} label={item} obj={obj} isArr={true} />
					</label>
				</div>
			))}
		</div>
	</>
)

const FilterDropdown = ({ data, label, labelPlural, callback }: any) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<div id={label}>
			<div className='input-wrapper'>
				<select className='form-select' name={labelPlural} onChange={callback}>
					<option selected>All</option>

					{data.map((item: any) => (
						<option key={item.name}>{item.name}</option>
					))}
				</select>
			</div>
		</div>
	</>
)

export default StarSearchPage
