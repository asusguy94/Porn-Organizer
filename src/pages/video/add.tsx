import { useState, useEffect } from 'react'

import {
	Grid,
	Button,
	Table,
	TableContainer,
	TableBody,
	TableRow,
	TableCell,
	TableHead,
	Typography,
	Paper
} from '@material-ui/core'

import Axios from 'axios'

import Spinner from '@components/spinner/spinner'

import { server as serverConfig } from '@/config'

const AddVideoPage = () => {
	const [videos, setVideos] = useState([])
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		Axios.post(`${serverConfig.source}/video`)
			.then(({ data }) => setVideos(data))
			.finally(() => setLoaded(true))
	}, [])

	return (
		<Grid className='text-center'>
			<Typography style={{ marginBottom: 8 }}>Import Videos</Typography>
			{loaded ? (
				!videos.length ? (
					<div className='text-center'>
						<Action
							label='Generate Thumbnails'
							callback={() => Axios.post(`${serverConfig.source}/generate/thumb`)}
						/>
						<Action
							label='Generate Metadata'
							callback={() => Axios.post(`${serverConfig.source}/generate/meta`)}
						/>
						<Action label='Generate VTT' disabled={true} />
					</div>
				) : (
					<>
						<TableContainer component={Paper}>
							<Table size='small' className='table-striped'>
								<TableHead>
									<TableRow>
										<TableCell>website</TableCell>
										<TableCell>site</TableCell>
										<TableCell>path</TableCell>
										<TableCell>title</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{videos.map((video: any) => {
										return (
											<TableRow key={video.path}>
												<TableCell>{video.website}</TableCell>
												<TableCell>{video.site}</TableCell>
												<TableCell>{video.path}</TableCell>
												<TableCell>{video.title}</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</TableContainer>

						<div style={{ marginTop: 8 }}>
							<Action
								label='Add Videos'
								callback={() =>
									Axios.post(`${serverConfig.source}/video/add`, { videos }).then(() => {
										window.location.reload()
									})
								}
							/>
						</div>
					</>
				)
			) : (
				<Spinner />
			)}
		</Grid>
	)
}

interface IAction {
	label: string
	callback?: () => void
	disabled?: boolean
}
const Action = ({ label, callback = () => {}, disabled = false }: IAction) => {
	const [isDisabled, setIsDisabled] = useState(disabled)

	const clickHandler = () => {
		if (!isDisabled) {
			setIsDisabled(true)

			callback()
		}
	}

	return (
		<Button
			variant='outlined'
			color='primary'
			disabled={isDisabled}
			onClick={clickHandler}
			style={{ marginLeft: 6, marginRight: 6 }}
		>
			{label}
		</Button>
	)
}

export default AddVideoPage
