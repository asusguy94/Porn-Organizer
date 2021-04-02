import { Component, useState, useEffect } from 'react'

import Axios from 'axios'
import capitalize from 'capitalize'

import './editor.scss'

import config from '../config.json'

//TODO pass down to child using cloneElement
//TODO implement country

const EditorPage = () => (
	<div id='editor-page' className='col-12 row'>
		<Wrapper label='attributes' name='attribute'>
			<WrapperItem label='attribute' />
		</Wrapper>

		<Wrapper label='categories' name='category'>
			<WrapperItem label='category' />
		</Wrapper>

		<Wrapper label='locations' name='location'>
			<WrapperItem label='location' />
		</Wrapper>

		<CountriesPage />
	</div>
)

const Wrapper = ({ label, name, children }: any) => {
	const [input, setInput] = useState('')

	const handleChange = (e: any) => setInput(e.target.value)

	const handleSubmit = () => {
		if (input.length) {
			if (input.toLowerCase() === input) return false

			Axios.post(`${config.api}/${name}`, { name: input }).then(() => {
				window.location.reload()

				//TODO use stateObj instead
			})
		}
	}

	const handleKeyPress = (e: any) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSubmit()
		}
	}

	return (
		<div className='col-3'>
			<header className='row'>
				<h2 className='col-4'>{capitalize(label)}</h2>

				<div className='col-8 mt-1'>
					<input type='text' className='col-8' onChange={handleChange} onKeyPress={handleKeyPress} />
					<div className='btn btn-sm btn-primary ms-1 mb-1' onClick={handleSubmit}>
						Add {capitalize(name)}
					</div>
				</div>
			</header>

			{children}
		</div>
	)
}

const WrapperItem = ({ label }: any) => {
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/${label}`).then(({ data }) => {
			data.sort((a: any, b: any) => a.id - b.id)

			setData(data)
		})
	}, [])

	const updateItem = (ref: any, value: any) => {
		Axios.put(`${config.api}/${label}/${ref.id}`, { value }).then(() => {
			setData(
				data.filter((item: any) => {
					if (ref.id === item.id) item.name = value

					return item
				})
			)
		})
	}

	return (
		<table className='table table-striped'>
			<thead>
				<tr>
					<th>ID</th>
					<th>{capitalize(label)}</th>
				</tr>
			</thead>

			<tbody>
				{data.map((item: any) => (
					<Item key={item.id} data={item} update={(ref: any, value: any) => updateItem(ref, value)} />
				))}
			</tbody>
		</table>
	)
}

const Item = ({ update, data }: any) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(null)

	const save = () => {
		setEdit(false)

		if (value) update(data, value)
	}

	const handleKeyPress = (e: any) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			save()
		}
	}

	const clickHandler = () => setEdit(true)
	const changeHandler = (e: any) => setValue(e.target.value)

	return (
		<tr>
			<th>{data.id}</th>
			<td className='btn-link' onClick={clickHandler}>
				{edit ? (
					<input
						type='text'
						defaultValue={data.name}
						autoFocus
						onBlur={save}
						onKeyPress={handleKeyPress}
						onChange={changeHandler}
					/>
				) : (
					<span>{data.name}</span>
				)}
			</td>
		</tr>
	)
}

class CountriesPage extends Component {
	state = {
		input: ''
	}

	handleChange(e: any) {
		this.setState({ input: e.target.value })
	}

	handleSubmit() {
		const { input } = this.state

		if (input.length) {
			// lower case is not allowed -- make red border and display notice
			if (input.toLowerCase() === input) return false

			Axios.post(`${config.api}/country`, { name: input }).then(() => {
				window.location.reload()
			})
		}
	}

	handleKeyPress(e: any) {
		if (e.key === 'Enter') {
			e.preventDefault()
			this.handleSubmit()
		}
	}

	render() {
		return (
			<div className='col-3'>
				<header className='row'>
					<h2 className='col-4'>Countries</h2>

					<div className='col-8 mt-1'>
						<input
							type='text'
							className='col-8'
							//@ts-ignore
							ref={(input: any) => (this.input = input)}
							onChange={this.handleChange.bind(this)}
							onKeyPress={this.handleKeyPress.bind(this)}
						/>
						<div className='btn btn-sm btn-primary ms-1 mb-1' onClick={this.handleSubmit.bind(this)}>
							Add Country
						</div>
					</div>
				</header>

				<Countries />
			</div>
		)
	}
}

class Countries extends Component {
	state = {
		countries: []
	}

	componentDidMount() {
		this.getData()
	}

	updateCountry(ref: any, value: any, label: any) {
		Axios.put(`${config.api}/country/${ref.id}`, { label, value }).then(({ data }) => {
			this.setState(
				this.state.countries.filter((country: any) => {
					if (ref.id === country.id) {
						country.name = data.name
						country.code = data.code
					}

					return country
				})
			)
		})
	}

	render() {
		return (
			<table className='table table-striped'>
				<thead>
					<tr>
						<th>ID</th>
						<th>Country</th>
						<th>Code</th>
						<th>Flag</th>
					</tr>
				</thead>

				<tbody>
					{this.state.countries.map((country: any) => (
						<Country
							key={country.id}
							data={country}
							updateCountry={(ref: any, value: any, label = 'country') =>
								this.updateCountry(ref, value, label)
							}
							updateCode={(ref: any, value: any, label = 'code') => this.updateCountry(ref, value, label)}
						/>
					))}
				</tbody>
			</table>
		)
	}

	getData() {
		Axios.get(`${config.api}/country`).then(({ data: countries }) => {
			countries.sort((a: any, b: any) => a.id - b.id)
			this.setState({ countries })
		})
	}
}

class Country extends Component<any> {
	state = {
		country: { edit: false, value: null },
		code: { edit: false, value: null }
	}

	saveCountry() {
		this.setState(({ country }: any) => {
			country.edit = false

			return { country }
		})

		if (this.state.country.value) {
			this.props.updateCountry(this.props.data, this.state.country.value)
		}
	}

	saveCode() {
		this.setState(({ code }: any) => {
			code.edit = false

			return { code }
		})

		if (this.state.code.value) {
			this.props.updateCode(this.props.data, this.state.code.value)
		}
	}

	render() {
		const { id, name, code } = this.props.data

		return (
			<tr>
				<th>{id}</th>
				<td
					className='btn-link'
					onClick={() => {
						this.setState(({ country }: any) => {
							country.edit = true

							return { country }
						})
					}}
				>
					{this.state.country.edit ? (
						<input
							type='text'
							defaultValue={name}
							autoFocus
							onBlur={this.saveCountry.bind(this)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									this.saveCountry()
								}
							}}
							onChange={(e) => {
								let value = e.target.value
								this.setState(({ country }: any) => {
									country.value = value

									return { country }
								})
							}}
						/>
					) : (
						<span>{name}</span>
					)}
				</td>
				<td
					className='btn-link'
					onClick={() => {
						this.setState(({ code }: any) => {
							code.edit = true

							return { code }
						})
					}}
				>
					{this.state.code.edit ? (
						<input
							type='text'
							defaultValue={code}
							autoFocus
							onBlur={this.saveCode.bind(this)}
							onKeyPress={(e) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									this.saveCode()
								}
							}}
							onChange={(e) => {
								let value = e.target.value
								this.setState(({ code }: any) => {
									code.value = value

									return { code }
								})
							}}
							maxLength={2}
						/>
					) : (
						<span>{code}</span>
					)}
				</td>

				<td>
					<i className={`flag flag-${code}`} />
				</td>
			</tr>
		)
	}
}

export default EditorPage
