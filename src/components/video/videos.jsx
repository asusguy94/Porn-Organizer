import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import { DaysToYears } from '../date/date'

import config from '../config.json'

const VideosPage = () => {
	const [videos, setVideos] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/video`).then(({ data }) => setVideos(data))
	}, [])

	return (
		<div className='col-12'>
			<div className='list-group'>
				{videos.map(video => (
					<li key={video.id} className='list-group-item list-group-item-action'>
						<span className='badge bg-primary rounded-pill me-2'>
							<DaysToYears days={video.ageInVideo} />
						</span>

						<Link className='col-11' to={`/video/${video.id}`}>
							{video.name}
						</Link>
					</li>
				))}
			</div>
		</div>
	)
}

export default VideosPage
