import React, { useState, useRef, createContext, useContext, useEffect } from 'react'
import { Link } from 'react-router-dom'

import {
	Box,
	Grid,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Typography,
	Button,
	TextField
} from '@material-ui/core'
import { Autocomplete, Alert, AlertTitle } from '@material-ui/lab'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Modal from '../modal/modal'
import { DaysToYears, dateToYears, daysToYears } from '../date/date'
import Ribbon from '../ribbon/ribbon'

import './star.scss'

import config from '../config.json'

const ModalContext = createContext((...args: any): void => {})
const UpdateContext = createContext({ star: (star: any): void => {} })

//TODO state is very complex
const StarPage = (props: any) => {
	const [modal, setModal] = useState({
		title: null,
		data: null,
		visible: false,
		filter: false
	})

	const [star, setStar] = useState({
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
	})

	const [starData, setStarData] = useState({
			breast: [],
			eyecolor: [],
			haircolor: [],
			ethnicity: [],
			country: []
	})

	const [videos, setVideos] = useState([])

	const handleModal = (title = null, data = null, filter = false) => {
		setModal((prevModal) => ({ title, data, visible: !prevModal.visible, filter }))
	}

	useEffect(() => {
		const { id } = props.match.params

		Axios.get(`${config.api}/star`).then(({ data }) => setStarData(data))
		Axios.get(`${config.api}/star/${id}`).then(({ data }) => setStar(data))
		Axios.get(`${config.api}/star/${id}/video`).then(({ data }) => setVideos(data))
	}, [])

		return (
			<Grid container id='star-page'>
			<Grid item xs={8}>
				{star.id !== 0 ? (
						<Grid item xs={3} id='star'>
						<UpdateContext.Provider value={{ star: (star: any) => setStar(star) }}>
							<StarImageDropbox star={star} />

								<ModalContext.Provider
								value={(title: any, data: any, filter: boolean) => handleModal(title, data, filter)}
								>
								<StarTitle star={star} />
								</ModalContext.Provider>

							<StarForm starData={starData} star={star} />
							</UpdateContext.Provider>
						</Grid>
					) : null}

				{videos.length ? (
					<StarVideos videos={videos} years={{ start: star.info.start, end: star.info.end }} />
					) : null}

				<Modal visible={modal.visible} title={modal.title} filter={modal.filter} onClose={handleModal}>
					{modal.data}
					</Modal>
				</Grid>

			<Grid item xs={4}>
				<Sidebar similar={star.similar} />
				</Grid>
			</Grid>
		)
	}

// Wrapper
const StarTitle = ({ star }: any) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).star

	const isIgnored = star.ignored === 1

	const copy = async () => await navigator.clipboard.writeText(star.name)

	const renameStar = (value: any) => {
		Axios.put(`${config.api}/star/${star.id}`, { name: value }).then(() => {
			update({ ...star, name: value })
		})
	}

	const ignoreStar = () => {
		Axios.put(`${config.api}/star/${star.id}`, { ignore: +!star.ignored }).then(({ data }) => {
			update({ ...star, ignored: data.autoTaggerIgnore })
		})
	}

	return (
		<Box>
			<Box className='d-inline-block'>
				<ContextMenuTrigger id='title'>
					<h2 className={isIgnored ? 'ignored' : ''}>{star.name}</h2>
				</ContextMenuTrigger>
			</Box>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Rename',
							<TextField
								variant='outlined'
								label='Star'
								defaultValue={star.name}
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										renameStar(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={config.theme.icons.edit} /> Rename
				</MenuItem>

				<MenuItem disabled>
					<i className={config.theme.icons.add} /> Add Alias
				</MenuItem>

				<MenuItem onClick={ignoreStar}>
					{isIgnored ? (
						<>
							<i className={config.theme.icons['toggle-yes']} /> Enable Star
						</>
					) : (
						<>
							<i className={config.theme.icons['toggle-no']} /> Ignore Star
						</>
					)}
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<i className={config.theme.icons.copy} /> Copy Star
				</MenuItem>
			</ContextMenu>
		</Box>
	)
}

const Sidebar = ({ similar }: any) => (
	<Card>
		<Typography variant='h5' className='text-center'>
			Similar Stars
		</Typography>

		<CardContent>
			<Grid id='similar'>
				{similar.map((similarStar) => (
					<a key={similarStar.id} href={`${similarStar.id}`} className='similar-star ribbon-container'>
						<Card className='star'>
							<CardMedia component='img' src={`${config.source}/images/stars/${similarStar.image}`} />

							<Typography>{similarStar.name}</Typography>

							<Ribbon label={`${similarStar.match}%`} />
						</Card>
					</a>
				))}
			</Grid>
		</CardContent>
	</Card>
)

const StarImageDropbox = ({ star }: any) => {
	const update = useContext(UpdateContext).star

	const [hover, setHover] = useState(false)

	const addLocalImage = (image: any) => console.log('Adding local file is not yet supported', image)

	const removeStar = () => {
		Axios.delete(`${config.api}/star/${star.id}`).then(() => {
			window.location.href = '/star'
		})
	}

	const removeImage = () => {
		Axios.delete(`${config.source}/star/${star.id}/image`).then(() => {
			update({ ...star, image: null })
		})
	}
	const addImage = (url: string) => {
		Axios.post(`${config.source}/star/${star.id}/image`, { url }).then(({ data }) => {
			update({ ...star, image: `${data.image}?v=${new Date().getTime()}` })
		})
	}

	const handleDefault = (e: React.DragEvent) => {
		e.stopPropagation()
		e.preventDefault()
	}

	const handleEnter = (e: React.DragEvent) => {
		handleDefault(e)

		setHover(true)
	}

	const handleLeave = (e: React.DragEvent) => {
		handleDefault(e)

		setHover(false)
	}

	const handleDrop = (e: React.DragEvent) => {
		handleDefault(e)

		const image = e.dataTransfer.getData('text')
		if (isLocalFile(image)) {
			let imageRef = e.dataTransfer.files
			if (imageRef.length === 1) {
				addLocalImage(imageRef[0])
			} else {
				console.log('Adding multiple images is not supported')
			}
		} else {
			addImage(image)
		}

		setHover(false)
	}

	const isLocalFile = (path: string) => !(path.indexOf('http://') > -1 || path.indexOf('https://') > -1)

	return (
		<Box className='d-inline-block'>
			{star.image !== null ? (
				<>
					<ContextMenuTrigger id='star__image'>
						<img className='star__image' src={`${config.source}/images/stars/${star.image}`} alt='star' />
					</ContextMenuTrigger>

					<ContextMenu id='star__image'>
						<MenuItem onClick={removeImage}>
							<i className={config.theme.icons.trash} /> Delete Image
						</MenuItem>
					</ContextMenu>
				</>
			) : (
				<>
					<ContextMenuTrigger id='star__dropbox'>
						<Box
							id='dropbox'
							className={`unselectable ${hover ? 'hover' : ''}`}
							onDragEnter={handleEnter}
							onDragOver={handleEnter}
							onDragLeave={handleLeave}
							onDrop={handleDrop}
						>
							<Box className='label'>Drop Image Here</Box>
						</Box>
					</ContextMenuTrigger>

					<ContextMenu id='star__dropbox'>
						<MenuItem onClick={removeStar}>
							<i className={config.theme.icons.trash} /> Remove Star
						</MenuItem>
					</ContextMenu>
				</>
			)}
		</Box>
	)
}

// Container
interface IStarForm {
	star: any
	starData: any
}
const StarForm = ({ star, starData }: IStarForm) => {
	const update = useContext(UpdateContext).star

	const updateInfo = (value: any, label: any) => {
		Axios.put(`${config.api}/star/${star.id}`, { label, value }).then(({ data }) => {
			if (data.reload) {
				window.location.reload()
			} else {
				if (data.content !== null) value = data.content

				update({ ...star, info: { ...star.info, [label]: value }, similar: data.similar })
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
		<>
			<Box className='action'>
				<Button variant='contained' color='primary' id='freeones' className='action__item' onClick={freeones}>
					Get Data
				</Button>

				<Button
					variant='contained'
					color='secondary'
					id='freeones_rs'
					className='action__item'
					onClick={freeonesReset}
				>
					Reset Data
				</Button>
			</Box>

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
		</>
	)
}

interface IStarVideos {
	videos: any
	years: any
}
const StarVideos = ({ videos, years }: IStarVideos) => {
	const [inRange, setInRange] = useState(true)
	const [websites, setWebsites] = useState<string[]>([])

	const [websiteFocus, setWebsiteFocus] = useState('')

	const endYear = years.end ?? null
	const startYear = years.start ?? null

	useEffect(() => setInRange(true), [years])

	return (
		<Box>
			{!inRange ? (
				<Alert severity='warning' className='alert'>
					<AlertTitle>Out of Range</AlertTitle>
					One or more of the video-dates does not match star-activity years
				</Alert>
			) : null}
			<Typography variant='h6'>
				Videos
				{websites.length > 1
					? websites.map((website) => (
							<Button
								key={website}
								size='small'
								variant='outlined'
								color='primary'
								style={{ marginRight: 8 }}
								onMouseOver={() => setWebsiteFocus(website)}
								onMouseLeave={() => setWebsiteFocus('')}
							>
								{website}
							</Button>
					  ))
					: null}
			</Typography>

			<Grid container id='videos'>
				{videos.map((video, i) => {
					const parsedYear = dateToYears(video.date)

					// Check if warning is already displayed
					//>> only display warning once
					if (inRange) {
						if (video.age !== null && daysToYears(video.age) < 18) {
							// if underaged >> probably wrong date
							setInRange(false)
						} else if (startYear && endYear) {
							if (parsedYear < startYear || parsedYear > endYear) setInRange(false)
						} else if (startYear) {
							if (parsedYear < startYear) setInRange(false)
						} else if (endYear) {
							if (parsedYear > endYear) setInRange(false)
						}
					}

					if (!websites.includes(video.website)) {
						setWebsites([...websites, video.website])
					}

					return (
						<StarVideo
							key={video.id}
							video={video}
							isFirst={videos.length > 1 && i === 0}
							isLast={videos.length > 1 && i === videos.length - 1}
							hidden={websiteFocus.length > 0 && websiteFocus !== video.website}
						/>
					)
				})}
			</Grid>
		</Box>
	)
}

// ContainerItem
interface IStarInputForm {
	update: any
	value: any
	name: any
	list?: any[]
}
const StarInputForm: React.FC<IStarInputForm> = ({ update, value, name, list = [], children }) => {
	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState(value)

	const label = name.toLowerCase()

	const updateValue = (value: any) => {
		if (value === '') setOpen(false)

		setInputValue(value)
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (!open && e.key === 'Enter') {
			update(inputValue, label)
		}
	}

	const isChanged = () => {
		const serverValue = (value || '').toLowerCase()
		const clientValue = (inputValue || '').toLowerCase()

		return clientValue !== serverValue
	}

	return (
		<Box style={{ marginBottom: 4 }}>
			<Autocomplete
				id={label}
				value={value}
				//
				// EVENTS
				onInputChange={(e, val) => updateValue(val)}
				onKeyPress={handleKeyPress}
				//
				// OPTIONS
				options={list.map((item) => (typeof item === 'object' ? item.name : item))}
				renderInput={(params) => (
					<TextField {...params} label={name} error={isChanged()} className='autocomplete' />
				)}
				autoHighlight
				//
				// open/closed STATUS
				open={open}
				onOpen={() => setOpen(true && list.length > 0)}
				onClose={() => setOpen(false)}
				//
				// SIMULATE input instead of dropdown
				forcePopupIcon={list.length > 0}
			/>

			{children ? <Box className='d-inline-block'>{children}</Box> : null}
		</Box>
	)
}

interface IStarVideo {
	video: any
	isFirst: boolean
	isLast: boolean
	hidden: boolean
}
const StarVideo = ({ video, isFirst, isLast, hidden }: IStarVideo) => {
	const [src, setSrc] = useState('')
	const [dataSrc, setDataSrc] = useState(`${config.source}/videos/${video.fname}`)

	const thumbnail: any = useRef()

	const reload = async () => {
		setSrc(dataSrc)
		setDataSrc('')
	}

	const unload = () => {
		setDataSrc(src)
		setSrc('')
	}

	const playFrom = (video: any, time = 0) => {
		if (time) video.currentTime = time

		video.play()
	}

	const stopFrom = (video: any, time = 0) => {
		if (time) video.currentTime = time

		video.pause()
	}

	const startThumbnailPlayback = async (video: any) => {
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

	const stopThumbnailPlayback = async (video: any) => {
		stopFrom(video)

		clearInterval(thumbnail.current)
	}

	const handleMouseEnter = ({ target }: { target: React.ReactNode }) => {
		if (dataSrc.length && !src.length) {
			reload().then(() => startThumbnailPlayback(target))
		}
	}

	const handleMouseLeave = ({ target }: { target: React.ReactNode }) => {
		if (!dataSrc.length && src.length) {
			stopThumbnailPlayback(target).then(() => unload())
		}
	}

	return (
		<Link className={`video  ${hidden ? 'hidden' : ''}`} to={`/video/${video.id}`}>
			<Card className='ribbon-container'>
				<CardActionArea>
					<CardMedia
						component='video'
						src={src}
						data-src={dataSrc}
						poster={`${config.source}/images/videos/${video.image}`}
						preload='metadata'
						muted
						onMouseEnter={handleMouseEnter}
						onMouseLeave={handleMouseLeave}
					/>

					<CardContent className='video__info'>
						<Typography className='video__title'>{video.name}</Typography>
						<Typography className='video__site-info site-info'>
							<span className='site-info__wsite'>{video.website}</span>

							{video.site !== null ? (
								<>
									<span className='divider'>/</span>
									<span className='site-info__site'>{video.site}</span>
								</>
							) : null}
						</Typography>

						<Ribbon isFirst={isFirst} isLast={isLast} align='left' />

						{/* @ts-ignore */}
						{video.age ? <Ribbon label={<DaysToYears days={video.age} />} /> : null}
					</CardContent>
				</CardActionArea>
			</Card>
		</Link>
	)
}

export default StarPage
