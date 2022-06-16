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
} from '@mui/material'

import Axios from 'axios'

import Spinner from '@components/spinner/spinner'

import { server as serverConfig } from '@/config'
import { AxiosData } from '@/interfaces'

const AddVideoPage = () => {
	interface IVideoFile {
		path: string
		website: string
		site: string
		title: string
	}

	const [videos, setVideos] = useState<IVideoFile[]>([])
	const [loaded, setLoaded] = useState(false)
	const [pages, setPages] = useState(0)

	useEffect(() => {
		Axios.post(`${serverConfig.source}/video`)
			.then(({ data: { files, pages } }: AxiosData<{ files: IVideoFile[]; pages: number }>) => {
				setVideos(files)
				setPages(pages)
			})
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
						<Action
							label='Generate VTT'
							callback={() => Axios.post(`${serverConfig.source}/generate/vtt`)}
							disabled
						/>
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
									{videos.map((video) => {
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
								label={`Add Videos ${pages > 1 ? ` (${pages - 1} pages remaining)` : ''}`}
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

interface ActionProps {
	label: string
	callback?: () => void
	disabled?: boolean
}
const Action = ({ label, callback = () => {}, disabled = false }: ActionProps) => {
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
