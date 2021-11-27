import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Grid, List, ListItem, ListItemText, Badge } from '@mui/material'

import Axios from 'axios'

import { daysToYears } from '@components/date/date'

import { server as serverConfig } from '@/config'

interface IVideo {
	id: number
	name: string
	ageInVideo: number
}

const VideosPage = () => {
	const [videos, setVideos] = useState([])

	useEffect(() => {
		Axios.get(`${serverConfig.api}/video`).then(({ data }) => setVideos(data))
	}, [])

	return (
		<Grid item id='videos-page'>
			<List>
				{videos.map((video: IVideo) => (
					<ListItem button divider key={video.id}>
						<Badge
							color='primary'
							badgeContent={daysToYears(video.ageInVideo)}
							style={{ marginRight: '2em' }}
						/>

						<Link to={`/video/${video.id}`}>
							<ListItemText>{video.name}</ListItemText>
						</Link>
					</ListItem>
				))}
			</List>
		</Grid>
	)
}

export default VideosPage
