import React, { useState, useRef, createContext, useContext, useEffect } from 'react'
import { useParams } from 'react-router-dom'

import {
	Button,
	TextField,
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
import { useCopyToClipboard } from 'usehooks-ts'

import RouterLink from '@components/router-link/router-link'
import Modal from '@components/modal/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon/ribbon'
import Dropbox from '@components/dropbox/dropbox'
import Flag from '@components/flag/flag'
import Icon from '@components/icon/icon'

import { daysToYears } from '@/date'

import { starApi } from '@/api'

import { ICountry, IGeneral, ISetState, ISimilar, IStarVideo } from '@/interfaces'

import { server as serverConfig } from '@/config'

import styles from './star.module.scss'

import ModalContext, { ModalContextProvider } from '@/context/modal-context'
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
		<Grid container>
			<Grid item xs={8}>
				{star.id !== 0 ? (
					<Grid item xs={3} id={styles.star}>
						<UpdateContext.Provider value={{ star: (star: any) => setStar(star) }}>
							<StarImageDropbox star={star} />

							<ModalContextProvider
								onModal={(title: any, data: any, filter: any) => handleModal(title, data, filter)}
							>
								<StarTitle star={star} />
							</ModalContextProvider>

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
	const [, setClipboard] = useCopyToClipboard()

	const handleModal = useContext(ModalContext).method
	const update = useContext(UpdateContext).star

	const copy = async () => await setClipboard(star.name)

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
		<div>
			<div className='d-inline-block'>
				<ContextMenuTrigger id='title'>
					<h2 id={star.ignored ? styles.ignored : ''}>{star.name}</h2>
				</ContextMenuTrigger>
			</div>

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
					<Icon code='edit' /> Rename
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
					<Icon code='add' /> Add Alias
				</MenuItem>

				<MenuItem onClick={ignoreStar}>
					{star.ignored ? (
						<>
							<Icon code='toggle-yes' /> Enable Star
						</>
					) : (
						<>
							<Icon code='toggle-no' /> Ignore Star
						</>
					)}
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<Icon code='copy' /> Copy Star
				</MenuItem>
			</ContextMenu>
		</div>
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
			<Grid id={styles.similar}>
				{similar.map((similarStar) => (
					<a key={similarStar.id} href={`${similarStar.id}`} className={styles.star}>
						<RibbonContainer component={Card}>
							<CardMedia component='img' src={`${serverConfig.source}/star/${similarStar.id}`} />

							<Typography>{similarStar.name}</Typography>

							<Ribbon label={`${similarStar.match}%`} />
						</RibbonContainer>
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

	const removeStar = () => {
		starApi.removeStar(star.id).then(() => {
			window.location.href = '/star'
		})
	}

	const removeImage = () => {
		Axios.delete(`${serverConfig.source}/star/${star.id}/image`).then(() => {
			update({ ...star, image: '' })
		})
	}
	const addImage = (url: string) => {
		Axios.post(`${serverConfig.source}/star/${star.id}/image`, { url }).then(({ data }) => {
			update({ ...star, image: `${data.image}?v=${new Date().getTime()}` })
		})
	}

	return (
		<div className='d-inline-block'>
			{star.image.length > 0 ? (
				<>
					<ContextMenuTrigger id='star__image'>
						<img
							id={styles.profile}
							src={`${serverConfig.source}/star/${star.id}?${Date.now()}`}
							alt='star'
						/>
					</ContextMenuTrigger>

					<ContextMenu id='star__image'>
						<MenuItem onClick={removeImage}>
							<Icon code='trash' /> Delete Image
						</MenuItem>
					</ContextMenu>
				</>
			) : (
				<>
					<ContextMenuTrigger id='star__dropbox'>
						<Dropbox onDrop={addImage} />
					</ContextMenuTrigger>

					<ContextMenu id='star__dropbox'>
						<MenuItem onClick={removeStar}>
							<Icon code='trash' /> Remove Star
						</MenuItem>
					</ContextMenu>
				</>
			)}
		</div>
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
	const handleModal = useContext(ModalContext).method
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

			<div>
				<ContextMenuTrigger id='get-data' renderTag='span'>
					<Button
						variant='contained'
						color='primary'
						id='freeones'
						className={styles.action}
						onClick={() => freeones()}
					>
						Get Data
					</Button>
				</ContextMenuTrigger>

				<Button
					variant='contained'
					color='error'
					id='freeones_rs'
					className={styles.action}
					onClick={freeonesReset}
				>
					Reset Data
				</Button>
			</div>

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
				<Flag code={star.info.country.code} style={{ marginLeft: 5, marginBottom: -5 }} />
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
		<div>
			{similar.some((star) => star.match === 100) ? (
				<Alert severity='warning' id={styles.alert}>
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
									className={`${styles.video} ${video.hidden ? styles.hidden : ''}`}
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
		</div>
	)
}

// ContainerItem
interface StarInputFormProps {
	update: (value: string, label: string) => void
	value: string
	name: string
	list?: (string | ICountry)[]
	capitalize?: boolean
	children?: React.ReactNode
}
const StarInputForm = ({ update, value, name, list = [], children, capitalize = false }: StarInputFormProps) => {
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
							className={`${capitalize ? styles.capitalize : ''} ${isChanged ? styles.error : ''}`}
							InputProps={{ style: { borderBottomColor: 'black' } }}
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
		<RibbonContainer component={Card}>
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

				<CardContent className={styles.info}>
					<Typography className='text-center'>{video.name}</Typography>
					<Typography className={styles['site-info']}>
						<span className={styles.wsite}>{video.website}</span>

						{video.site !== null ? (
							<>
								<span className='divider'>/</span>
								<span className={styles.site}>{video.site}</span>
							</>
						) : null}
					</Typography>

					<Ribbon isFirst={isFirst} isLast={isLast} align='left' />

					{video.age ? <Ribbon label={daysToYears(video.age)} /> : null}
				</CardContent>
			</CardActionArea>
		</RibbonContainer>
	)
}

export default StarPage
