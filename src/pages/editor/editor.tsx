import React, { FC, useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'

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

import { server as serverConfig } from '@/config'

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

		<Wrapper label='countries' name='country'>
			<WrapperItemCountries label='country' />
		</Wrapper>
	</Grid>
)

const Wrapper: FC<{ label: string; name: string }> = ({ label, name, children }) => {
	const [input, setInput] = useState('')

	const handleChange = (e: ChangeEvent<HTMLInputElement>) => setInput(e.currentTarget.value)

	const handleSubmit = () => {
		if (input.length) {
			if (input.toLowerCase() === input) return false

			Axios.post(`${serverConfig.api}/${name}`, { name: input }).then(() => {
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
			<Grid container justify='center' style={{ marginBottom: 10 }}>
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

	const updateItem = (ref: any, value: any) => {
		Axios.put(`${serverConfig.api}/${label}/${ref.id}`, { value }).then(() => {
			setData(
				[...data].filter((item: any) => {
					if (ref.id === item.id) item.name = value

					return item
				})
			)
		})
	}

	useEffect(() => {
		Axios.get(`${serverConfig.api}/${label}`).then(({ data }) => {
			setData(data.sort((a: { id: number; name: string }, b: { id: number; name: string }) => a.id - b.id))
		})
	}, [])

	return (
		<TableContainer component={Paper}>
			<Table size='small' className='table-striped'>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>{capitalize(label)}</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((item: any) => (
						<Item key={item.id} data={item} update={updateItem} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

const WrapperItemCountries = ({ label }: { label: string }) => {
	const [data, setData] = useState([])

	const updateItem = (ref: any, value: any, label: any) => {
		Axios.put(`${serverConfig.api}/${label}/${ref.id}`, { label, value }).then(({ data: countryData }) => {
			setData(
				[...data].filter((country: any) => {
					if (ref.id === country.id) {
						country.name = countryData.name
						country.code = countryData.code
					}

					return country
				})
			)
		})
	}

	useEffect(() => {
		Axios.get(`${serverConfig.api}/${label}`).then(({ data }) => {
			setData(data.sort((a: { id: number; name: string }, b: { id: number; name: string }) => a.id - b.id))
		})
	}, [])

	return (
		<TableContainer component={Paper}>
			<Table size='small' className='table-striped'>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Country</TableCell>
						<TableCell>Code</TableCell>
						<TableCell>Flag</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((item: any) => (
						<ItemCountry
							key={item.id}
							data={item}
							updateCountry={(ref: any, value: any, label = 'country') => updateItem(ref, value, label)}
							updateCode={(ref: any, value: any, label = 'code') => updateItem(ref, value, label)}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

const Item = ({ update, data }: any) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState('')

	const save = () => {
		setEdit(false)

		if (value.length) update(data, value)
	}

	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell>
				{edit ? (
					<TextField
						defaultValue={data.name}
						autoFocus
						onBlur={save}
						onKeyPress={(e) => {
							if (e.key === 'Enter') {
								save()
							}
						}}
						onChange={(e) => setValue(e.currentTarget.value)}
					/>
				) : (
					<span onClick={() => setEdit(true)}>{data.name}</span>
				)}
			</TableCell>
		</TableRow>
	)
}

const ItemCountry = ({ updateCountry, updateCode, data }: any) => {
	const [country, setCountry] = useState<{ edit: boolean; value: null | string }>({ edit: false, value: null })
	const [code, setCode] = useState<{ edit: boolean; value: null | string }>({ edit: false, value: null })

	const saveCountry = () => {
		setCountry({ ...country, edit: false })

		if (country.value) updateCountry(data, country.value)
	}

	const saveCode = () => {
		setCode({ ...code, edit: true })

		if (code.value) updateCode(data, code.value)
	}

	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell onClick={() => setCountry({ ...country, edit: true })}>
				{country.edit ? (
					<TextField
						defaultValue={data.name}
						autoFocus
						onBlur={saveCountry}
						onChange={(e) => setCountry({ ...country, value: e.target.value })}
						onKeyPress={(e: React.KeyboardEvent) => {
							if (e.key === 'Enter') saveCountry()
						}}
					/>
				) : (
					<span>{data.name}</span>
				)}
			</TableCell>

			<TableCell onClick={() => setCode({ ...country, edit: true })}>
				{code.edit ? (
					<TextField
						defaultValue={data.code}
						autoFocus
						onBlur={saveCode}
						onChange={(e) => setCode({ ...country, value: e.target.value })}
						inputProps={{ maxLength: 2 }}
						onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => {
							if (e.key === 'Enter') saveCode()
						}}
					/>
				) : (
					<span>{data.code}</span>
				)}
			</TableCell>

			<TableCell className='pb-0'>
				<i className={`flag flag-${data.code}`} />
			</TableCell>
		</TableRow>
	)
}

export default EditorPage
