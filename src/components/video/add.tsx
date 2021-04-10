import { useState, useEffect } from 'react'

import Axios from 'axios'

import Spinner from '../spinner/spinner'

import config from '../config.json'

const AddVideoPage = () => {
	const [videos, setVideos] = useState([])
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		Axios.post(`${config.source}/video`)
			.then(({ data }) => setVideos(data))
			.finally(() => setLoaded(true))
	}, [])

	return (
		<div className='col-12'>
			<h2 className='text-center'>Import Videos</h2>
			{loaded ? (
				!videos.length ? (
					<div className='text-center'>
						<Button
							label='Generate Thumbnails'
							callback={() => Axios.post(`${config.source}/generate/thumb`)}
						/>
						<Button
							label='Generate Metadata'
							callback={() => Axios.post(`${config.source}/generate/meta`)}
						/>
						<Button label='Generate VTT' disabled={true} />
					</div>
				) : (
					<>
						<table className='table table-sm table-striped'>
							<thead>
								<tr>
									<th>website</th>
									<th>site</th>
									<th>path</th>
									<th>title</th>
								</tr>
							</thead>

							<tbody>
								{videos.map((video: any) => {
									return (
										<tr key={video.path}>
											<td>{video.website}</td>
											<td>{video.site}</td>
											<td>{video.path}</td>
											<td>{video.title}</td>
										</tr>
									)
								})}
							</tbody>
						</table>

						<div className='text-center'>
							<Button
								label='Add Videos'
								callback={() =>
									Axios.post(`${config.source}/video/add`, { videos }).then(() => {
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
		</div>
	)
}

const Button = ({ label, callback, disabled = false }: any) => {
	const [isDisabled, setIsDisabled] = useState(disabled)

	const clickHandler = () => {
		if (!isDisabled) {
			setIsDisabled(true)

			callback()
		}
	}

	return (
		<div className={`btn btn-info mx-1 ${isDisabled ? 'disabled' : ''}`} onClick={clickHandler}>
			{label}
		</div>
	)
}

export default AddVideoPage
