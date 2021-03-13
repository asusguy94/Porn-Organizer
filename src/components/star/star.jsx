import { Component, useState, useRef, createContext, useContext } from 'react'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Modal from '../modal/modal'
import { DaysToYears } from '../date/date'
import Ribbon from '../ribbon/ribbon'
import { setFocus } from '../../hooks'

import './star.scss'

import config from '../config.json'

const ModalContext = createContext(null)
const UpdateContext = createContext({ star: null })

//TODO state is very complex
class StarPage extends Component {
	state = {
		star: {
			id: 0,
			name: '',
			image: '',
			ignored: 0,
			info: {
				breast: '',
				eyecolor: '',
				haircolor: '',
				ethnicity: '',
				county: {
					name: '',
					code: ''
				},
				birthdate: '',
				height: 0,
				weight: 0,
				start: 0,
				end: 0
			},
			similar: []
		},
		starData: {
			breast: [],
			eyecolor: [],
			haircolor: [],
			ethnicity: [],
			country: []
		},
		videos: [],
		modal: {
			visible: false,
			title: null,
			data: null,
			filter: false
		}
	}

	handleModal(title = null, data = null, filter = false) {
		if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

		this.setState(({ modal }) => {
			modal.title = title
			modal.data = data
			modal.visible = !modal.visible
			modal.filter = filter

			return { modal }
		})
	}

	render() {
		return (
			<div id='star-page' className='col-12 row'>
				<section className='col-7'>
					{this.state.star.id !== 0 ? (
						<div id='star'>
							<UpdateContext.Provider value={{ star: star => this.setState({ star }) }}>
								<StarImageDropbox star={this.state.star} />

								<ModalContext.Provider
									value={(title, data, filter) => this.handleModal(title, data, filter)}
								>
									<StarTitle star={this.state.star} />
								</ModalContext.Provider>

								<StarForm starData={this.state.starData} star={this.state.star} />
							</UpdateContext.Provider>
						</div>
					) : null}

					<StarVideos videos={this.state.videos} />

					<Modal
						visible={this.state.modal.visible}
						title={this.state.modal.title}
						filter={this.state.modal.filter}
						onClose={() => this.handleModal()}
					>
						{this.state.modal.data}
					</Modal>
				</section>

				<Sidebar similar={this.state.star.similar} />
			</div>
		)
	}

	componentDidMount() {
		const { id } = this.props.match.params

		Axios.get(`${config.api}/star/${id}`).then(({ data: star }) => this.setState({ star }))
		Axios.get(`${config.api}/star/${id}/video`).then(({ data: videos }) => this.setState({ videos }))
		Axios.get(`${config.api}/star`).then(({ data: starData }) => this.setState({ starData }))
	}
}

// Wrapper
const StarTitle = ({ star }) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).star

	const copy = async () => await navigator.clipboard.writeText(star.name)
	const isIgnored = () => star.ignored === 1

	const renameStar = value => {
		Axios.get(`${config.api}/renamestar.php?starID=${star.id}&name=${value}`).then(() => {
			star.name = value

			update(star)
		})
	}

	const ignoreStar = () => {
		Axios.put(`${config.api}/star/${star.id}`, { ignore: +!star.ignored }).then(({ data }) => {
			star.ignored = data.autoTaggerIgnore

			update(star)
		})
	}

	return (
		<>
			<ContextMenuTrigger id='title'>
				<h2 className={isIgnored() ? 'ignored' : ''}>{star.name}</h2>
			</ContextMenuTrigger>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Rename',
							<input
								type='text'
								defaultValue={star.name}
								ref={setFocus}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										renameStar(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} /> Rename
				</MenuItem>

				<MenuItem disabled>
					<i className={`${config.theme.fa} fa-plus`} /> Add Alias
				</MenuItem>

				<MenuItem onClick={ignoreStar}>
					<i className={`${config.theme.fa} ${isIgnored() ? 'fa-check' : 'fa-ban'}`} />{' '}
					{isIgnored() ? 'Enable Star' : 'Ignore Star'}
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<i className={`${config.theme.fa} fa-copy`} /> Copy Star
				</MenuItem>
			</ContextMenu>
		</>
	)
}

const Sidebar = ({ similar }) => (
	<aside className='col-5'>
		<div className='card'>
			<h2 className='card-header text-center'>Similar Stars</h2>

			<div className='card-body'>
				<div id='similar'>
					{similar.map(similarStar => (
						<a key={similarStar.id} href={similarStar.id} className='similar-star ribbon-container card'>
							<img
								src={`${config.source}/images/stars/${similarStar.image}`}
								className='card-img-top'
								alt='similar'
							/>
							<h3 className='card-title'>{similarStar.name}</h3>

							<Ribbon label={`${similarStar.match}%`} />
						</a>
					))}
				</div>
			</div>
		</div>
	</aside>
)

const StarImageDropbox = ({ star }) => {
	const update = useContext(UpdateContext).star

	const [hover, setHover] = useState(false)

	const addLocalImage = image => console.log('Adding local file is not yet supported', image)

	const removeStar = () => {
		Axios.delete(`${config.api}/star/${star.id}`).then(() => {
			window.location.href = '/star'
		})
	}

	const removeImage = () => {
		Axios.delete(`${config.source}/star/${star.id}/image`).then(() => {
			star.image = null

			update(star)
		})
	}
	const addImage = url => {
		Axios.post(`${config.source}/star/${star.id}/image`, { url }).then(({ data }) => {
			star.image = data.image

			update(star)
		})
	}

	const handleDefault = e => {
		e.stopPropagation()
		e.preventDefault()
	}

	const handleEnter = e => {
		handleDefault(e)

		setHover(true)
	}

	const handleLeave = e => {
		handleDefault(e)

		setHover(false)
	}

	const handleDrop = e => {
		handleDefault(e)

		let image = e.dataTransfer.getData('text')
		if (isLocalFile(image)) {
			image = e.dataTransfer.files
			if (image.length === 1) {
				addLocalImage(image[0])
			} else {
				console.log('Adding multiple images is not supported')
			}
		} else {
			addImage(image)
		}

		setHover(false)
	}

	const isLocalFile = path => !(path.indexOf('http://') > -1 || path.indexOf('https://') > -1)

	if (star.image !== null) {
		return (
			<>
				<ContextMenuTrigger id='star__image'>
					<img className='star__image' src={`${config.source}/images/stars/${star.image}`} alt='star' />
				</ContextMenuTrigger>

				<ContextMenu id='star__image'>
					<MenuItem onClick={removeImage}>
						<i className={`${config.theme.fa} fa-trash-alt`} /> Delete Image
					</MenuItem>
				</ContextMenu>
			</>
		)
	} else {
		return (
			<>
				<ContextMenuTrigger id='star__dropbox'>
					<div
						id='dropbox'
						className={`unselectable ${hover ? 'hover' : ''}`}
						onDragEnter={handleEnter}
						onDragOver={handleEnter}
						onDragLeave={handleLeave}
						onDrop={handleDrop}
					>
						<div className='label'>Drop Image Here</div>
					</div>
				</ContextMenuTrigger>

				<ContextMenu id='star__dropbox'>
					<MenuItem onClick={removeStar}>
						<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Star
					</MenuItem>
				</ContextMenu>
			</>
		)
	}
}

// Container
const StarForm = ({ star, starData }) => {
	const update = useContext(UpdateContext).star

	const updateInfo = (value, label) => {
		Axios.put(`${config.api}/star/${star.id}`, { label, value }).then(({ data }) => {
			if (data.reload) {
				window.location.reload()
			} else {
				if (data.content !== null) value = data.content

				star.info[label] = value
				star.similar = data.similar

				update(star)
			}
		})
	}

	const freeones = () => {
		Axios.post(`${config.api}/star/${star.id}/freeones`).then(() => {
			window.location.reload()

			//TODO use stateObj
		})
	}

	const freeonesReset = () => {
		Axios.delete(`${config.api}/star/${star.id}/freeones`).then(() => {
			window.location.reload()

			//TODO use stateObj
		})
	}

	return (
		<div>
			<div className='action'>
				<div id='freeones' className='btn btn-primary' onClick={freeones}>
					Get Data
				</div>

				<div id='freeones_rs' className='btn btn-outline-secondary' onClick={freeonesReset}>
					Reset Data
				</div>
			</div>

			<StarInputForm update={updateInfo} name='Breast' value={star.info.breast} list={starData.breast} />
			<StarInputForm update={updateInfo} name='EyeColor' value={star.info.eyecolor} list={starData.eyecolor} />
			<StarInputForm update={updateInfo} name='HairColor' value={star.info.haircolor} list={starData.haircolor} />
			<StarInputForm update={updateInfo} name='Ethnicity' value={star.info.ethnicity} list={starData.ethnicity} />
			<StarInputForm update={updateInfo} name='Country' value={star.info.country.name} list={starData.country}>
				<i className={`flag flag-${star.info.country.code}`} />
			</StarInputForm>
			<StarInputForm update={updateInfo} name='Birthdate' value={star.info.birthdate} />
			<StarInputForm update={updateInfo} name='Height' value={star.info.height} />
			<StarInputForm update={updateInfo} name='Weight' value={star.info.weight} />
			<StarInputForm update={updateInfo} name='Start' value={star.info.start} />
			<StarInputForm update={updateInfo} name='End' value={star.info.end} />
		</div>
	)
}

const StarVideos = ({ videos }) => (
	<>
		<h3>Videos</h3>
		<div id='videos' className='row'>
			{videos.map((video, i) => {
				return (
					<StarVideo
						key={video.id}
						video={video}
						isFirst={videos.length > 1 && i === 0}
						isLast={videos.length > 1 && i === videos.length - 1}
					/>
				)
			})}
		</div>
	</>
)

// ContainerItem
const StarInputForm = ({ update, value, name, type, list, children }) => {
	const [inputID, setInputID] = useState('')
	const [inputValue, setInputValue] = useState(value)

	const updateValue = e => {
		setInputID(e.target.id)
		setInputValue(e.target.value)
	}

	const keyPress = e => {
		if (e.key === 'Enter') {
			if (inputID.length) {
				update(inputValue, inputID)
			}
		}
	}

	const isChanged = () => {
		const serverValue = (value || '').toLowerCase()
		const clientValue = (inputValue || '').toLowerCase()

		return clientValue !== serverValue
	}

	return (
		<div className='input-wrapper mb-2'>
			<label className={isChanged() ? 'bold' : ''} htmlFor={name.toLowerCase()}>
				{name}
			</label>

			<input
				type={type}
				id={name.toLowerCase()}
				defaultValue={value}
				onChange={updateValue}
				onKeyDown={keyPress}
				list={`${name.toLowerCase()}s`}
			/>

			{list ? (
				<datalist id={`${name.toLowerCase()}s`}>
					{list.map(item =>
						typeof item === 'object' ? (
							<option key={item.name} value={item.name} />
						) : (
							<option key={item} value={item} />
						)
					)}
				</datalist>
			) : null}

			{children}
		</div>
	)
}

const StarVideo = ({ video, isFirst, isLast }) => {
	const [src, setSrc] = useState('')
	const [dataSrc, setDataSrc] = useState(`${config.source}/videos/${video.fname}`)

	const thumbnail = useRef()

	const reload = async () => {
		setSrc(dataSrc)
		setDataSrc('')
	}

	const unload = () => {
		setDataSrc(src)
		setSrc('')
	}

	const playFrom = (video, time = 0) => {
		if (time) video.currentTime = time

		video.play()
	}

	const stopFrom = (video, time = 0) => {
		if (time) video.currentTime = time

		video.pause()
	}

	const startThumbnailPlayback = async video => {
		let time = 100
		const offset = 60
		const duration = 1.5

		playFrom(video)
		thumbnail.current = setInterval(() => {
			time += offset
			if (time > video.duration) {
				stopThumbnailPlayback(video).then(() => startThumbnailPlayback(video))
			}
			playFrom(video, (time += offset))
		}, duration * 1000)
	}

	const stopThumbnailPlayback = async video => {
		stopFrom(video)

		clearInterval(thumbnail.current)
	}

	const handleMouseEnter = ({ target }) => {
		if (dataSrc.length && !src.length) {
			reload().then(() => startThumbnailPlayback(target))
		}
	}

	const handleMouseLeave = ({ target }) => {
		if (!dataSrc.length && src.length) {
			stopThumbnailPlayback(target).then(() => unload())
		}
	}

	return (
		<a className='video ribbon-container card' href={`/video/${video.id}`}>
			<video
				className='card-img-top'
				src={src}
				data-src={dataSrc}
				poster={`${config.source}/images/videos/${video.image}`}
				preload='metadata'
				muted
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			/>

			<span className='title card-title'>{video.name}</span>
			<span className='info card-subtitle'>
				<span className='wsite'>{video.website}</span>

				{video.site !== '' ? (
					<>
						<span className='divider'>/</span>
						<span className='site'>{video.site}</span>
					</>
				) : null}
			</span>

			<Ribbon isFirst={isFirst} isLast={isLast} align='left' />

			{video.age ? <Ribbon label={<DaysToYears days={video.age} />} /> : null}
		</a>
	)
}

export default StarPage
