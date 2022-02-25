import { useState, useEffect } from 'react'

import { Grid, List, ListItem, ListItemText, Badge, Typography, Link } from '@mui/material'

import Axios from 'axios'

import { daysToYears } from '@components/date/date'
import RouterLink from '@components/router-link/router-link'

import { server as serverConfig } from '@/config'

interface IVideo {
	id: number
	name: string
	ageInVideo: number
}

const VideosPage = () => (
	<Grid item id='videos-page'>
		<Helper source={`${serverConfig.api}/video`} label='without-bookmark' />
	</Grid>
)

const Helper = ({ source, label }: { source: string; label: string }) => {
	const [videos, setVideos] = useState<IVideo[]>([])

	useEffect(() => {
		Axios.get(source).then(({ data }) => setVideos(data))
	}, [source])

	return (
		<Grid item id={`videos-${label}`}>
			<Typography variant='h4'>
				{label} ({videos.length})
			</Typography>
			<List>
				{videos.map((video) => (
					<Link component={RouterLink} key={`${label}-${video.id}`} href={`${video.id}`}>
						<ListItem button divider>
						<Badge
							color='primary'
							badgeContent={daysToYears(video.ageInVideo)}
							style={{ marginRight: '2em' }}
						/>

							<ListItemText>{video.name}</ListItemText>
					</ListItem>
					</Link>
				))}
			</List>
		</Grid>
	)
}

export default VideosPage
