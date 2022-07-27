import React, { useState, useRef, createContext, useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
	Button,
	TextField,
	Box,
	Grid,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Typography,
	Autocomplete,
	Alert,
	AlertTitle,
	Link
} from '@mui/material'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { Flipper, Flipped } from 'react-flip-toolkit'

import RouterLink from '@components/router-link/router-link'
import Modal from '@components/modal/modal'
import { daysToYears } from '@components/date/date'
import Ribbon from '@components/ribbon/ribbon'

import './star.scss'

import { server as serverConfig, theme as themeConfig } from '@/config'

import { ICountry, IGeneral, ISetState, ISimilar, IStarVideo } from '@/interfaces'
import { starApi } from '@/api'

const ModalContext = createContext((...args: any): void => {})
const UpdateContext = createContext({ star: (star: any): void => {} })

interface IStar extends IGeneral {
	image: string
	ignored: boolean
	info: {
		breast: string
		eyecolor: string
		haircolor: string
		ethnicity: string
		country: ICountry
		birthdate: string
		height: number
		weight: number
	}
	similar: ISimilar[]
}

interface IStarData {
	breast: string[]
	country: ICountry[]
	ethnicity: string[]
	eyecolor: string[]
	haircolor: string[]
}

//TODO state is very complex
const StarPage = () => {
	const { id } = useParams()

	const [modal, setModal] = useState({
		title: null,
		data: null,
		visible: false,
		filter: false
	})

	const [star, setStar] = useState<IStar>({
		id: 0,
		name: '',
		image: '',
		ignored: false,
		info: {
			breast: '',
			eyecolor: '',
			haircolor: '',
			ethnicity: '',
			country: {
				name: '',
				code: ''
			},
			birthdate: '',
			height: 0,
			weight: 0
		},
		similar: []
	})

	const [starData, setStarData] = useState<IStarData>({
		breast: [],
		eyecolor: [],
		haircolor: [],
		ethnicity: [],
		country: []
	})

	const [videos, setVideos] = useState<IStarVideo[]>([])

	const handleModal = (title = null, data = null, filter = false) => {
		setModal((prevModal) => ({ title, data, visible: !prevModal.visible, filter }))
	}

	useEffect(() => {
		starApi.getInfo().then(({ data }) => setStarData(data))
		if (id !== undefined) {
			const starID = parseInt(id)

			starApi.getStar<IStar>(starID).then(({ data }) => setStar(data))
			starApi.getVideos(starID).then(({ data }) => setVideos(data))
		}
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

				{videos.length ? <StarVideos videos={videos} update={setVideos} similar={star.similar} /> : null}

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

interface StarTitleProps {
	star: IStar
}
const StarTitle = ({ star }: StarTitleProps) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).star

	const copy = async () => await navigator.clipboard.writeText(star.name)

	const renameStar = (value: string) => {
		starApi.renameStar(star.id, value).then(() => {
			update({ ...star, name: value })
		})
	}

	const ignoreStar = () => {
		starApi.ignoreStar(star).then(({ data }) => {
			update({ ...star, ignored: data.autoTaggerIgnore })
		})
	}

	const addAlias = (alias: string) => {
		starApi.addAlias(star.id, alias).then(() => {
			//TODO starAlias is not rendered, so just refresh the page for now
			window.location.reload()
		})
	}

	return (
		<Box>
			<Box className='d-inline-block'>
				<ContextMenuTrigger id='title'>
					<h2 className={star.ignored ? 'ignored' : ''}>{star.name}</h2>
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

										renameStar((e.target as HTMLInputElement).value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Rename
				</MenuItem>

				<MenuItem
					onClick={() =>
						handleModal(
							'Add Alias',
							<TextField
								variant='outlined'
								label='Star'
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										addAlias((e.target as HTMLInputElement).value)
									}
								}}
							/>
						)
					}
				>
					<i className={themeConfig.icons.add} /> Add Alias
				</MenuItem>

				<MenuItem onClick={ignoreStar}>
					{star.ignored ? (
						<>
							<i className={themeConfig.icons['toggle-yes']} /> Enable Star
						</>
					) : (
						<>
							<i className={themeConfig.icons['toggle-no']} /> Ignore Star
						</>
					)}
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<i className={themeConfig.icons.copy} /> Copy Star
				</MenuItem>
			</ContextMenu>
		</Box>
	)
}

interface SidebarProps {
	similar: ISimilar[]
}

const Sidebar = ({ similar }: SidebarProps) => (
	<Card>
		<Typography variant='h5' className='text-center'>
			Similar Stars
		</Typography>

		<CardContent>
			<Grid id='similar'>
				{similar.map((similarStar) => (
					<a key={similarStar.id} href={`${similarStar.id}`} className='similar-star ribbon-container'>
						<Card className='star'>
							<CardMedia component='img' src={`${serverConfig.source}/star/${similarStar.id}`} />

							<Typography>{similarStar.name}</Typography>

							<Ribbon label={`${similarStar.match}%`} />
						</Card>
					</a>
				))}
			</Grid>
		</CardContent>
	</Card>
)

interface StarImageDropboxProps {
	star: IStar
}
const StarImageDropbox = ({ star }: StarImageDropboxProps) => {
	const update = useContext(UpdateContext).star

	const [hover, setHover] = useState(false)

	const addLocalImage = (image: any) => console.log('Adding local file is not yet supported', image)

	const removeStar = () => {
		starApi.removeStar(star.id).then(() => {
			window.location.href = '/star'
		})
	}

	const removeImage = () => {
		Axios.delete(`${serverConfig.source}/star/${star.id}/image`).then(() => {
			update({ ...star, image: null })
		})
	}
	const addImage = (url: string) => {
		Axios.post(`${serverConfig.source}/star/${star.id}/image`, { url }).then(({ data }) => {
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
						<img
							className='star__image'
							src={`${serverConfig.source}/star/${star.id}?${Date.now()}`}
							alt='star'
						/>
					</ContextMenuTrigger>

					<ContextMenu id='star__image'>
						<MenuItem onClick={removeImage}>
							<i className={themeConfig.icons.trash} /> Delete Image
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
							<i className={themeConfig.icons.trash} /> Remove Star
						</MenuItem>
					</ContextMenu>
				</>
			)}
		</Box>
	)
}

interface StarFormProps {
	star: {
		id: number
		ignored: boolean
		image: string
		info: any
		name: string
		similar: ISimilar[]
	}
	starData: IStarData
}
const StarForm = ({ star, starData }: StarFormProps) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).star

	const updateInfo = (value: string, label: string) => {
		Axios.put(`${serverConfig.api}/star/${star.id}`, { label, value }).then(({ data }) => {
			if (data.reload) {
				window.location.reload()
			} else {
				if (data.content !== null) value = data.content

				update({ ...star, info: { ...star.info, [label]: value }, similar: data.similar })
			}
		})
	}

	const freeones = (url: string | undefined = undefined) => {
		Axios.post(`${serverConfig.api}/star/${star.id}/freeones`, { star: url }).then(() => {
			window.location.reload()

			//TODO use stateObj
		})
	}

	const freeonesReset = () => {
		Axios.delete(`${serverConfig.api}/star/${star.id}/freeones`).then(() => {
			window.location.reload()

			//TODO use stateObj
		})
	}

	return (
		<>
			<ContextMenu id='get-data'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Get Data',
							<TextField
								variant='outlined'
								label='Star'
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										freeones((e.target as HTMLInputElement).value)
									}
								}}
							/>
						)
					}}
				>
					Get Data from URL
				</MenuItem>
			</ContextMenu>

			<Box className='action'>
				<ContextMenuTrigger id='get-data' renderTag='span'>
					<Button
						variant='contained'
						color='primary'
						id='freeones'
						className='action__item'
						onClick={() => freeones()}
					>
						Get Data
					</Button>
				</ContextMenuTrigger>

				<Button
					variant='contained'
					color='error'
					id='freeones_rs'
					className='action__item'
					onClick={freeonesReset}
				>
					Reset Data
				</Button>
			</Box>

			<StarInputForm
				update={updateInfo}
				name='Breast'
				value={star.info.breast}
				list={starData.breast}
				capitalize
			/>
			<StarInputForm update={updateInfo} name='EyeColor' value={star.info.eyecolor} list={starData.eyecolor} />
			<StarInputForm update={updateInfo} name='HairColor' value={star.info.haircolor} list={starData.haircolor} />
			<StarInputForm update={updateInfo} name='Ethnicity' value={star.info.ethnicity} list={starData.ethnicity} />
			<StarInputForm update={updateInfo} name='Country' value={star.info.country.name} list={starData.country}>
				<i className={`flag flag-${star.info.country.code}`} />
			</StarInputForm>
			<StarInputForm update={updateInfo} name='Birthdate' value={star.info.birthdate} />
			<StarInputForm update={updateInfo} name='Height' value={star.info.height} />
			<StarInputForm update={updateInfo} name='Weight' value={star.info.weight} />
		</>
	)
}

interface StarVideosProps {
	videos: IStarVideo[]
	similar: ISimilar[]
	update: ISetState<IStarVideo[]>
}
const StarVideos = ({ videos, update, similar }: StarVideosProps) => {
	const [websites, setWebsites] = useState<string[]>([])
	const [websiteFocus, setWebsiteFocus] = useState<String[]>([])

	useEffect(() => {
		update([...videos].sort((a, b) => a.age - b.age).sort((a, b) => Number(a.hidden) - Number(b.hidden)))
	}, [websiteFocus])

	const toggleWebsiteFocus = (website: string) => {
		// allow multiple websites to be selected
		if (websiteFocus.includes(website)) {
			// remove website from websiteFocus
			setWebsiteFocus(websiteFocus.filter((websiteItem) => websiteItem !== website))
		} else {
			// add website to websiteFocus
			setWebsiteFocus([...websiteFocus, website])
		}
	}

	return (
		<Box>
			{similar.some((star) => star.match === 100) ? (
				<Alert severity='warning' className='alert'>
					<AlertTitle>
						Possible Duplicates: <strong>{similar.filter((star) => star.match === 100).length}</strong>
					</AlertTitle>
				</Alert>
			) : null}

			<Typography variant='h6'>
				Videos
				{websites.length > 1
					? websites.map((website) => (
							<Button
								key={website}
								size='small'
								variant={websiteFocus.includes(website) ? 'contained' : 'outlined'}
								color='primary'
								style={{ marginRight: 8 }}
								onClick={() => toggleWebsiteFocus(website)}
							>
								{website}
							</Button>
					  ))
					: null}
			</Typography>

			<Flipper flipKey={videos}>
				<Grid container id='videos'>
					{videos.map((video, i) => {
						if (!websites.includes(video.website)) {
							setWebsites([...websites, video.website])
						}

						video.hidden = websiteFocus.length > 0 && !websiteFocus.includes(video.website)

						return (
							<Flipped key={video.id} flipId={video.id}>
								<Link
									component={RouterLink}
									className={`video ${video.hidden ? 'hidden' : ''}`}
									href={`/video/${video.id}`}
								>
									<StarVideo
										video={video}
										isFirst={videos.length > 1 && i === 0}
										isLast={videos.length > 1 && i === videos.length - 1}
										isHidden={video.hidden}
									/>
								</Link>
							</Flipped>
						)
					})}
				</Grid>
			</Flipper>
		</Box>
	)
}

// ContainerItem
interface StarInputFormProps {
	update: (value: string, label: string) => void
	value: string
	name: string
	list?: (string | ICountry)[]
	capitalize?: boolean
}
const StarInputForm: React.FC<StarInputFormProps> = ({
	update,
	value,
	name,
	list = [],
	children,
	capitalize = false
}) => {
	const hasDropdown = list.length > 0

	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')

	const updateValue = (value: string) => {
		if (value === '') setOpen(false)

		setInputValue(value)
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (!open && e.key === 'Enter') {
			update(inputValue, name.toLowerCase())
		}
	}

	const isChanged = inputValue.toLowerCase() !== (value || '').toLowerCase()
	const shouldShrink = isChanged || (typeof value === 'string' && value.length > 0)

	useEffect(() => {
		if (value) {
			setInputValue(value)
		}
	}, [value])

	return (
		<Grid container style={{ marginBottom: 4 }}>
			<Grid item xs={10}>
				<Autocomplete
					inputValue={inputValue}
					//
					// EVENTS
					onInputChange={(e, val, reason) => {
						if (reason === 'reset' && !open) return

						updateValue(val)
					}}
					onKeyPress={handleKeyPress}
					//
					// OPTIONS
					options={list.map((item) => (typeof item === 'object' ? item.name : item))}
					renderInput={(params) => (
						<TextField
							{...params}
							variant='standard'
							label={name}
							error={isChanged}
							InputLabelProps={{ shrink: shouldShrink }}
							className={capitalize ? 'capitalize' : ''}
						/>
					)}
					autoHighlight
					clearOnBlur={false}
					//
					// open/closed STATUS
					open={open}
					onOpen={() => setOpen(true && hasDropdown)}
					onClose={() => setOpen(false)}
					//
					// SIMULATE input instead of dropdown
					forcePopupIcon={hasDropdown}
				/>
			</Grid>

			<Grid item style={{ marginTop: 18, marginLeft: 2 }}>
				{children}
			</Grid>
		</Grid>
	)
}

interface StarVideoProps {
	video: IStarVideo
	isFirst: boolean
	isLast: boolean
	isHidden: boolean
}
const StarVideo = ({ video, isFirst, isLast, isHidden }: StarVideoProps) => {
	const [src, setSrc] = useState('')
	const [dataSrc, setDataSrc] = useState(`${serverConfig.source}/videos/${video.fname}`)

	const thumbnail: any = useRef()

	const reload = async () => {
		setSrc(dataSrc)
		setDataSrc('')
	}

	const unload = () => {
		setDataSrc(src)
		setSrc('')
	}

	const playFrom = (video: HTMLVideoElement, time = 0) => {
		if (time) video.currentTime = time

		video.play()
	}

	const stopFrom = (video: HTMLVideoElement, time = 0) => {
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

	const stopThumbnailPlayback = async (video: HTMLVideoElement) => {
		stopFrom(video)

		clearInterval(thumbnail.current)
	}

	const handleMouseEnter = ({ target }: any) => {
		if (!isHidden) {
			if (dataSrc.length && !src.length) {
				reload().then(() => startThumbnailPlayback(target))
			}
		}
	}

	const handleMouseLeave = (e: React.MouseEvent<HTMLVideoElement>) => {
		if (!dataSrc.length && src.length) {
			stopThumbnailPlayback(e.currentTarget).then(() => unload())
		}
	}

	return (
		<Card className='ribbon-container'>
			<CardActionArea>
				<CardMedia
					component='video'
					src={src}
					data-src={dataSrc}
					poster={`${serverConfig.source}/video/${video.id}/thumb`}
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

					{video.age ? <Ribbon label={daysToYears(video.age)} /> : null}
				</CardContent>
			</CardActionArea>
		</Card>
	)
}

export default StarPage
