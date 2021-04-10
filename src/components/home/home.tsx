import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'
import capitalize from 'capitalize'

import './home.scss'

import config from '../config.json'

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
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/home/${label}/${limit}`).then(({ data }) => setData(data))
	}, [])

	if (enabled && data.length) {
		return (
			<section className='col-12'>
				<h2>
					{capitalize(label)} (<span className='count'>{data.length}</span>)
				</h2>

				<div className='row'>
					{data.map((video: IVideo) => (
						<div key={video.id} className='row mx-0 px-2 col-1'>
							<Link className='video px-0 col-12 ribbon-container' to={`/video/${video.id}`}>
								<img
									className='mx-auto img-thumbnail'
									alt='video'
									src={`${config.source}/images/videos/${video.image}`}
								/>

								<span className='video__title mx-auto d-block'>{video.name}</span>

								{video.total > 0 ? <span className='ribbon'>{video.total}</span> : null}
							</Link>
						</div>
					))}
				</div>
			</section>
		)
	}

	return null
}

const HomePage = () => (
	<div id='home-page'>
		<HomeColumn label='recent' />
		<HomeColumn label='newest' />
		<HomeColumn label='popular' limit={24} />
		<HomeColumn label='random' enabled={false} />
	</div>
)

export default HomePage
