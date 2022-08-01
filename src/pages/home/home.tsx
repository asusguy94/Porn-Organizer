import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Grid } from '@mui/material'

import axios from 'axios'
import capitalize from 'capitalize'

import Ribbon, { RibbonContainer } from '@components/ribbon/ribbon'

import { IGeneral } from '@/interfaces'

import { server as serverConfig } from '@/config'

import classes from './home.module.scss'

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
		<Grid container component='section' style={{ marginBottom: '0.5em' }}>
			<h2
				style={{
					marginTop: 0,
					marginBottom: 0
				}}
			>
				{capitalize(label)} (<span style={{ color: 'green' }}>{data.length}</span>)
			</h2>

			<Grid container spacing={2} columns={colSize}>
				{data.map((video) => (
					<Grid item xs={1} key={video.id}>
						<Link to={`/video/${video.id}`}>
							<RibbonContainer className={classes.video}>
								<img
									src={`${serverConfig.source}/video/${video.id}/thumb`}
									className={classes.thumb}
									alt='video'
								/>

								<div className={classes.title}>{video.name}</div>

								{video.total ? <Ribbon label={video.total} /> : null}
							</RibbonContainer>
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
