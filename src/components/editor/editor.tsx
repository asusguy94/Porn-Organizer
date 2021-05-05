import React, { FC, Component, useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'

import {
	Grid,
	Button,
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TextField,
	Paper
} from '@material-ui/core'

import Axios from 'axios'
import capitalize from 'capitalize'

import './editor.scss'

import config from '../config.json'

//TODO pass down to child using cloneElement
//TODO implement country

const EditorPage = () => (
	<Grid container id='editor-page'>
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
	</Grid>
)

const Wrapper: FC<{ label: string; name: string }> = ({ label, name, children }) => {
	const [input, setInput] = useState('')

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.currentTarget.value)

	const handleSubmit = () => {
		if (input.length) {
			if (input.toLowerCase() === input) return false

			Axios.post(`${config.api}/${name}`, { name: input }).then(() => {
				window.location.reload()

				//TODO use stateObj instead
			})
		}
	}

	const handleKeyPress = (e: KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSubmit()
		}
	}

	return (
		<Grid item xs={3} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
			<Grid container justify='center' style={{ marginBottom: 10 }} xs={12}>
				<Grid item component='h2'>
					{capitalize(label)}
				</Grid>

				<Grid item>
					<TextField
						onChange={handleChange}
						onKeyPress={handleKeyPress}
						style={{ marginLeft: 5, marginRight: 5 }}
					/>

					<Button
						variant='contained'
						color='primary'
						size='small'
						onClick={handleSubmit}
						style={{ marginTop: 2 }}
					>
						Add {capitalize(name)}
					</Button>
				</Grid>
			</Grid>

			{children}
		</Grid>
	)
}

const WrapperItem = ({ label }: { label: string }) => {
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/${label}`).then(({ data }) => {
			data.sort((a: { id: number; name: string }, b: { id: number; name: string }) => a.id - b.id)

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
		<TableContainer component={Paper}>
			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>{capitalize(label)}</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((item: any) => (
						<Item key={item.id} data={item} update={(ref: any, value: any) => updateItem(ref, value)} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

const Item = ({ update, data }: any) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(null)

	const save = () => {
		setEdit(false)

		if (value) update(data, value)
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			save()
		}
	}

	const clickHandler = () => setEdit(true)
	const changeHandler = (e: any) => setValue(e.currentTarget.value)

	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell>
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
					<span onClick={clickHandler}>{data.name}</span>
				)}
			</TableCell>
		</TableRow>
	)
}

class CountriesPage extends Component {
	state = {
		input: ''
	}

	handleChange(e: any) {
		this.setState({ input: e.currentTarget.value })
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

	handleKeyPress(e: React.KeyboardEvent) {
		if (e.key === 'Enter') {
			e.preventDefault()
			this.handleSubmit()
		}
	}

	render() {
		return (
			<Grid item xs={3} style={{ paddingLeft: 5, paddingRight: 5, marginTop: 5 }}>
				<Grid container justify='center' style={{ marginBottom: 10 }} xs={12}>
					<Grid item component='h2'>
						Countries
					</Grid>

					<Grid item>
						<TextField
							//@ts-ignore
							ref={(input: any) => (this.input = input)}
							onChange={this.handleChange.bind(this)}
							onKeyPress={this.handleKeyPress.bind(this)}
							style={{ marginLeft: 5, marginRight: 5 }}
						/>
						<Button
							variant='contained'
							color='primary'
							size='small'
							onClick={this.handleSubmit.bind(this)}
							style={{ marginTop: 2 }}
						>
							Add Country
						</Button>
					</Grid>
				</Grid>

				<Countries />
			</Grid>
		)
	}
}

class Countries extends Component {
	state = {
		countries: []
	}

	componentDidMount() {
		Axios.get(`${config.api}/country`).then(({ data: countries }) => {
			countries.sort((a: ICountry, b: ICountry) => a.id - b.id)
			this.setState({ countries })
		})
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
			<TableContainer component={Paper}>
				<Table size='small'>
					<TableHead>
						<TableRow>
							<TableCell>ID</TableCell>
							<TableCell>Country</TableCell>
							<TableCell>Code</TableCell>
							<TableCell>Flag</TableCell>
						</TableRow>
					</TableHead>

					<TableBody>
						{this.state.countries.map((country: any) => (
							<Country
								key={country.id}
								data={country}
								updateCountry={(ref: any, value: any, label = 'country') =>
									this.updateCountry(ref, value, label)
								}
								updateCode={(ref: any, value: any, label = 'code') =>
									this.updateCountry(ref, value, label)
								}
							/>
						))}
					</TableBody>
				</Table>
			</TableContainer>
		)
	}
}

interface ICountry {
	id: number
	name: string
	code: string
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
			<TableRow>
				<TableCell>{id}</TableCell>
				<TableCell
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
							onKeyPress={(e: React.KeyboardEvent) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									this.saveCountry()
								}
							}}
							onChange={(e) => {
								let value = e.currentTarget.value
								this.setState(({ country }: any) => {
									country.value = value

									return { country }
								})
							}}
						/>
					) : (
						<span>{name}</span>
					)}
				</TableCell>

				<TableCell
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
							onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
								if (e.key === 'Enter') {
									e.preventDefault()
									this.saveCode()
								}
							}}
							onChange={(e) => {
								let value = e.currentTarget.value
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
				</TableCell>
				<TableCell>
					<i className={`flag flag-${code}`} />
				</TableCell>
			</TableRow>
		)
	}
}

export default EditorPage
