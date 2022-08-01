import React, { useState, useEffect, ChangeEvent, KeyboardEvent } from 'react'

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
} from '@mui/material'

import Axios from 'axios'
import capitalize from 'capitalize'

import Flag from '@components/flag/flag'

import classes from './editor.module.scss'

import { server as serverConfig } from '@/config'
import { AxiosData, ICountryExtended, IGeneral } from '@/interfaces'

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

interface WrapperProps {
	label: string
	name: string
	children?: React.ReactNode
}
const Wrapper = ({ label, name, children }: WrapperProps) => {
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
			<Grid container justifyContent='center' style={{ marginBottom: 10 }}>
				<Grid item component='h2'>
					{capitalize(label)}
				</Grid>

				<Grid item>
					<TextField
						variant='standard'
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

interface WrapperItemProps {
	label: string
}
const WrapperItem = ({ label }: WrapperItemProps) => {
	const [data, setData] = useState<IGeneral[]>([])

	const updateItem = (ref: IGeneral, value: string) => {
		Axios.put(`${serverConfig.api}/${label}/${ref.id}`, { value }).then(() => {
			setData(
				[...data].filter((item) => {
					if (ref.id === item.id) item.name = value

					return item
				})
			)
		})
	}

	useEffect(() => {
		Axios.get(`${serverConfig.api}/${label}`).then(({ data }: AxiosData<IGeneral[]>) => {
			setData(data.sort((a, b) => a.id - b.id))
		})
	}, [])

	return (
		<TableContainer component={Paper}>
			<Table size='small' className={classes['table-striped']}>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>{capitalize(label)}</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((item) => (
						<Item key={item.id} data={item} update={updateItem} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

interface WrapperItemCountriesProps {
	label: string
}
const WrapperItemCountries = ({ label }: WrapperItemCountriesProps) => {
	const [data, setData] = useState<ICountryExtended[]>([])

	const updateItem = (ref: { id: number }, value: string, label: string) => {
		Axios.put(`${serverConfig.api}/country/${ref.id}`, { label, value }).then(({ data: countryData }) => {
			setData(
				[...data].filter((country) => {
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
		Axios.get(`${serverConfig.api}/${label}`).then(({ data }: AxiosData<ICountryExtended[]>) => {
			setData(data.sort((a, b) => a.id - b.id))
		})
	}, [])

	return (
		<TableContainer component={Paper}>
			<Table size='small' className={classes['table-striped']}>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>Country</TableCell>
						<TableCell>Code</TableCell>
						<TableCell>Flag</TableCell>
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((item) => (
						<ItemCountry
							key={item.id}
							data={item}
							updateCountry={(ref, value) => updateItem(ref, value, 'country')}
							updateCode={(ref, value) => updateItem(ref, value, 'code')}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

interface ItemProps {
	update: (ref: IGeneral, value: string) => void
	data: IGeneral
}
const Item = ({ update, data }: ItemProps) => {
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
						variant='standard'
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

interface ItemCountryProps {
	updateCountry: (ref: { id: number }, value: string) => void
	updateCode: (ref: { id: number }, value: string) => void
	data: ICountryExtended
}
const ItemCountry = ({ updateCountry, updateCode, data }: ItemCountryProps) => {
	const [country, setCountry] = useState<{ edit: boolean; value: null | string }>({ edit: false, value: null })
	const [code, setCode] = useState<{ edit: boolean; value: null | string }>({ edit: false, value: null })

	const saveCountry = () => {
		setCountry({ ...country, edit: false })

		if (country.value) updateCountry(data, country.value)
	}

	const saveCode = () => {
		setCode({ ...code, edit: false })

		if (code.value) updateCode(data, code.value)
	}

	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell onClick={() => setCountry({ ...country, edit: true })}>
				{country.edit ? (
					<TextField
						variant='standard'
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

			<TableCell onClick={() => setCode({ ...code, edit: true })}>
				{code.edit ? (
					<TextField
						variant='standard'
						defaultValue={data.code}
						autoFocus
						onBlur={saveCode}
						onChange={(e) => setCode({ ...code, value: e.target.value })}
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
				<Flag code={data.code} />
			</TableCell>
		</TableRow>
	)
}

export default EditorPage
