import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Grid, Box } from '@mui/material'

import axios from 'axios'
import capitalize from 'capitalize'

import Ribbon from '@components/ribbon/ribbon'

import './home.scss'

import { server as serverConfig } from '@/config'
import { IGeneral } from '@/interfaces'

interface HomeColumnProps {
	enabled?: boolean
	label: string
	limit?: number
	rows?: number
	colSize?: number
}
export const HomeColumn = ({ enabled = true, label, rows = 1, limit = -1, colSize = 10 }: HomeColumnProps) => {
	interface IVideo extends IGeneral {
		total?: number
	}

	const [data, setData] = useState<IVideo[]>([])

	if (limit === -1) {
		limit = rows * colSize
	}

	useEffect(() => {
		if (enabled) {
			axios.get(`${serverConfig.api}/home/${label}/${limit}`).then(({ data }) => setData(data))
		}
	}, [])

	if (!data.length) return null

	return (
		<Grid container component='section'>
			<h2>
				{capitalize(label)} (<span className='count'>{data.length}</span>)
			</h2>

			<Grid container spacing={2} columns={colSize}>
				{data.map((video) => (
					<Grid item xs={1} key={video.id}>
						<Link to={`/video/${video.id}`}>
							<Box className='video ribbon-container'>
								<img
									src={`${serverConfig.source}/video/${video.id}/thumb`}
									className='img-thumbnail'
									alt='video'
								/>

								<Box className='video__title'>{video.name}</Box>

								{video.total ? <Ribbon label={video.total} /> : null}
							</Box>
						</Link>
					</Grid>
				))}
			</Grid>
		</Grid>
	)
}

const HomePage = () => (
	<Grid container id='home-page'>
		<HomeColumn label='recent' />
		<HomeColumn label='newest' />
		<HomeColumn label='popular' rows={2} />
	</Grid>
)

export default HomePage
