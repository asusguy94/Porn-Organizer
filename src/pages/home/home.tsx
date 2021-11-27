import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Grid, Box } from '@mui/material'

import Axios from 'axios'
import capitalize from 'capitalize'

import Ribbon from '@components/ribbon/ribbon'

import './home.scss'

import { server as serverConfig } from '@/config'

interface IHomeColumn {
	enabled?: boolean
	label: string
	limit?: number
}

interface IVideo {
	id: number
	image: string
	name: string
	total: number
}

const HomeColumn = ({ enabled = true, label, limit = 12 }: IHomeColumn) => {
	const [data, setData] = useState<IVideo[]>([])

	useEffect(() => {
		Axios.get(`${serverConfig.api}/home/${label}/${limit}`).then(({ data }) => setData(data))
	}, [])

	if (enabled && data.length) {
		return (
			<Grid container component='section'>
				<h2>
					{capitalize(label)} (<span className='count'>{data.length}</span>)
				</h2>

				<Grid container spacing={2}>
					{data.map((video) => (
						<Grid item xs={1} key={video.id}>
							<Link to={`/video/${video.id}`}>
								<Box className='video ribbon-container'>
									<img
										src={`${serverConfig.source}/images/videos/${video.image}`}
										className='img-thumbnail'
										alt='video'
									/>

									<Box className='video__title'>{video.name}</Box>

									{video.total > 0 ? <Ribbon label={video.total} /> : null}
								</Box>
							</Link>
						</Grid>
					))}
				</Grid>
			</Grid>
		)
	}

	return null
}

const HomePage = () => (
	<Grid container id='home-page'>
		<HomeColumn label='recent' />
		<HomeColumn label='newest' />
		<HomeColumn label='popular' limit={24} />
		<HomeColumn label='random' enabled={false} />
	</Grid>
)

export default HomePage
