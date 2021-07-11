import React, { Fragment, useEffect, useState, createContext, useContext } from 'react'
import { Link } from 'react-router-dom'

import { Grid, Button, Card, CardMedia, Box, Typography, TextField } from '@material-ui/core'

import Axios from 'axios'
//@ts-ignore
import { PlyrComponent } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
//@ts-ignore
import KeyboardEventHandler from 'react-keyboard-event-handler'

import Modal from '../modal/modal'
import Ribbon from '../ribbon/ribbon'
import Badge from '../badge/badge'
import { daysToYears } from '../date/date'
import { useRefWithEffect, useWindowSize } from '../../hooks'

import './video.scss'

import { server as serverConfig, theme as themeConfig, settings as settingsConfig } from '../../config'

import {
	IAttribute,
	ILocation,
	IBookmark as IVideoBookmark,
	ICategory,
	IVideo,
	IVideoStar,
	IKeyPress
} from '../../interfaces'

const UpdateContext = createContext({
	video: (video: IVideo): void => {},
	star: (star: IVideoStar): void => {},
	bookmarks: (bookmarks: IVideoBookmark[]): void => {}
})
const ModalContext = createContext({
	method: (...args: any): void => {},
	data: { visible: false, title: null, data: null, filter: false }
})

const VideoPage = (props: any) => {
	const [modal, setModal] = useState({
		visible: false,
		title: null,
		data: null,
		filter: false
	})

	const [video, setVideo] = useState({
			id: 0,
			nextID: null,
			name: '',
			star: '',
			path: {
				file: '',
				stream: ''
			},
			duration: 0,
			date: {
				added: '',
				published: ''
			},
			plays: 0,
			website: '',
			subsite: '',
			locations: [],
			attributes: []
	})

	const [star, setStar] = useState({
			id: 0,
			name: '',
			image: '',
			ageInVideo: 0,
			numVideos: 0
	})

	const [bookmarks, setBookmarks] = useState([])
	const [categories, setCategories] = useState([])
	const [attributes, setAttributes] = useState([])
	const [locations, setLocations] = useState([])

	const handleKeyPress = (key: string, e: IKeyPress) => {
		if (e.target.tagName === 'INPUT') return
		e.preventDefault()

		if (key === 'tab') {
			window.location.href = video.nextID ?? '/video'
		} else {
			console.log(`${key} was pressed`)
		}
	}

	const handleModal = (title = null, data = null, filter = false) => {
		setModal((prevModal) => ({ title, data, visible: !prevModal.visible, filter }))
	}

	useEffect(() => {
		const { id } = props.match.params

		Axios.get(`${serverConfig.api}/video/${id}`).then(({ data }) => setVideo(data))
		Axios.get(`${serverConfig.api}/video/${id}/bookmark`).then(({ data }) => setBookmarks(data))
		Axios.get(`${serverConfig.api}/video/${id}/star`).then(({ data }) => setStar(data))

		Axios.get(`${serverConfig.api}/category`).then(({ data }) => setCategories(data))
		Axios.get(`${serverConfig.api}/attribute`).then(({ data }) => setAttributes(data))
		Axios.get(`${serverConfig.api}/location`).then(({ data }) => setLocations(data))
	}, [])

		return (
			<Grid container id='video-page'>
				<UpdateContext.Provider
					value={{
					video: (video: any) => setVideo(video),
					star: (star: any) => setStar(star),
					bookmarks: (bookmarks: any) => setBookmarks(bookmarks)
					}}
				>
					<ModalContext.Provider
						value={{
						method: (title, data, filter) => handleModal(title, data, filter),
						data: modal
						}}
					>
						<Section
						video={video}
						locations={locations}
						attributes={attributes}
						categories={categories}
						bookmarks={bookmarks}
						star={star}
						/>
					</ModalContext.Provider>

					<Grid item xs={2} id='sidebar'>
						<Box id='stars'>
						<Star video={video} star={star} />

						<StarInput video={video} disabled={star.id !== 0} />
						</Box>
					</Grid>
				</UpdateContext.Provider>

			<Modal visible={modal.visible} title={modal.title} filter={modal.filter} onClose={handleModal}>
				{modal.data}
				</Modal>

			<KeyboardEventHandler handleKeys={['tab']} onKeyEvent={handleKeyPress} handleFocusableElements={true} />
			</Grid>
		)
	}

interface ISection {
	video: IVideo
	locations: ILocation[]
	attributes: IAttribute[]
	categories: ICategory[]
	bookmarks: IVideoBookmark[]
	star: IVideoStar
}
const Section = ({ video, locations, attributes, categories, bookmarks, star }: ISection) => {
	const [playerRef, ref] = useRefWithEffect()
	const [duration, setDuration] = useState(0)

	// Helper script for getting the player
	//@ts-ignore
	const getPlayer = () => ref?.player

	const playVideo = (time = null) => {
		const player = getPlayer()

		player.currentTime = time || player.currentTime
		player.play()
	}

	return (
		<Grid item xs={10}>
			<Header video={video} locations={locations} attributes={attributes} star={star} />

			<VideoPlayer
				video={video}
				categories={categories}
				bookmarks={bookmarks}
				star={star}
				playerRef={playerRef}
				playerValue={ref}
				updateDuration={setDuration}
			/>

			<Timeline
				bookmarks={bookmarks}
				video={video}
				categories={categories}
				playVideo={playVideo}
				duration={duration}
			/>
		</Grid>
	)
}

interface IStar {
	star: IVideoStar
	video: IVideo
}
const Star = ({ star, video }: IStar) => {
	const update = useContext(UpdateContext).star

	const removeStar = () => {
		Axios.delete(`${serverConfig.api}/video/${video.id}/star/${star.id}`).then(() => {
			update({ ...star, id: 0, name: '' })
		})
	}

	return (
		<>
			{star.id !== 0 && (
				<Box className='star'>
					<Card className='ribbon-container'>
						<Badge content={star.numVideos}>
						<ContextMenuTrigger id='star'>
							<CardMedia
								component='img'
									src={`${serverConfig.source}/images/stars/${star.image}`}
								className='star__image'
							/>

							<Link to={`/star/${star.id}`} className='star__name'>
									<Typography className='unselectable'>{star.name}</Typography>
							</Link>

							{star.ageInVideo > 0 ? <Ribbon label={daysToYears(star.ageInVideo)} /> : null}
						</ContextMenuTrigger>
						</Badge>
					</Card>

					<ContextMenu id='star'>
						<MenuItem onClick={removeStar}>
							<i className={themeConfig.icons.trash} /> Remove
						</MenuItem>
					</ContextMenu>
				</Box>
			)}
		</>
	)
}

interface IStarInput {
	video: IVideo
	disabled?: boolean
}
const StarInput = ({ video, disabled = false }: IStarInput) => {
	const update = useContext(UpdateContext).star

	const addStar = (star: string) => {
		Axios.post(`${serverConfig.api}/video/${video.id}/star`, { name: star }).then(({ data }) => {
			update(data)
		})
	}

	if (!disabled) {
		return (
			<TextField
				label='Star'
				variant='outlined'
				autoFocus
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						//@ts-ignore
						addStar(e.target.value)
					}
				}}
			/>
		)
	}

	return null
}

interface IHeader {
	video: IVideo
	attributes: IAttribute[]
	locations: ILocation[]
	star: IVideoStar
}
const Header = ({ video, attributes, locations, star }: IHeader) => (
	<Grid container component='header' id='header'>
		<Grid item xs={11}>
			<HeaderTitle video={video} attributes={attributes} locations={locations} />

			<HeaderDate video={video} star={star} />

			<HeaderLocations video={video} />

			<HeaderAttributes video={video} />

			<HeaderSite video={video} />
		</Grid>

		<Grid item xs={1}>
			<HeaderNext video={video} />
		</Grid>
	</Grid>
)

const HeaderSite = ({ video }: { video: IVideo }) => (
	<Box id='header__site'>
		<span className='wsite'>{video.website}</span>
		{video.subsite ? (
			<>
				<span className='divider'>-</span>
				<span className='site'>{video.subsite}</span>
			</>
		) : null}
	</Box>
)

const HeaderNext = ({ video }: { video: IVideo }) => (
	<Box id='header__next'>
		<a id='next' href={`/video/${video.nextID ?? ''}`}>
			<Button size='small' variant='outlined'>
				Next
			</Button>
		</a>
	</Box>
)

const HeaderLocations = ({ video }: { video: IVideo }) => {
	const update = useContext(UpdateContext).video

	const removeLocation = (location: ILocation) => {
		Axios.delete(`${serverConfig.api}/location/${location.id}`).then(() => {
			update({ ...video, locations: video.locations.filter((item) => item.id !== location.id) })
		})
	}

	return (
		<Box id='header__locations'>
			{video.id !== 0
				? video.locations
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((item) => (
						<Fragment key={item.id}>
							<ContextMenuTrigger id={`location-${item.id}`} renderTag='span'>
								<Button size='small' variant='outlined' color='secondary' className='location'>
										<i className={themeConfig.icons.map} />
									{item.name}
								</Button>
							</ContextMenuTrigger>

							<ContextMenu id={`location-${item.id}`}>
								<MenuItem onClick={() => removeLocation(item)}>
										<i className={themeConfig.icons.trash} /> Remove
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</Box>
	)
}

const HeaderAttributes = ({ video }: { video: IVideo }) => {
	const update = useContext(UpdateContext).video

	const removeAttribute = (attribute: IAttribute) => {
		Axios.delete(`${serverConfig.api}/attribute/${attribute.id}`).then(() => {
			update({ ...video, attributes: video.attributes.filter((item) => item.id !== attribute.id) })
		})
	}

	return (
		<Box id='header__attributes'>
			{video.id !== 0 &&
				video.attributes
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((item) => (
					<Fragment key={item.id}>
						<ContextMenuTrigger id={`attribute-${item.id}`} renderTag='span'>
							<Button size='small' variant='outlined' color='primary' className='attribute'>
									<i className={themeConfig.icons.tag} />
								{item.name}
							</Button>
						</ContextMenuTrigger>

						<ContextMenu id={`attribute-${item.id}`}>
							<MenuItem onClick={() => removeAttribute(item)}>
									<i className={themeConfig.icons.trash} /> Remove
							</MenuItem>
						</ContextMenu>
					</Fragment>
				))}
		</Box>
	)
}

interface IHeaderDate {
	video: IVideo
	star: IVideoStar
}
const HeaderDate = ({ video, star }: IHeaderDate) => {
	const { video: update, star: updateStar } = useContext(UpdateContext)

	const fixDate = () => {
		Axios.put(`${serverConfig.source}/video/${video.id}`, { date: true }).then(({ data }) => {
			updateStar({ ...star, ageInVideo: data.age })

			update({ ...video, date: { ...video.date, published: data.date } })
		})
	}

	return (
		<>
			<ContextMenuTrigger id='menu__date' renderTag='span'>
				<Button size='small' variant='outlined' id='header__date'>
					<i className={themeConfig.icons.calendar} />
					{video.date.published}
				</Button>
			</ContextMenuTrigger>

			<ContextMenu id='menu__date'>
				<MenuItem onClick={() => fixDate()}>
					<i className={themeConfig.icons.sync} /> Refresh Date
				</MenuItem>
			</ContextMenu>
		</>
	)
}

interface IHeaderTitle {
	video: IVideo
	attributes: IAttribute[]
	locations: ILocation[]
}
const HeaderTitle = ({ video, attributes, locations }: IHeaderTitle) => {
	const handleModal = useContext(ModalContext).method
	const update = useContext(UpdateContext).video

	const addLocation = (location: ILocation) => {
		Axios.post(`${serverConfig.api}/video/${video.id}/location`, { locationID: location.id }).then(({ data }) => {
			update({
				...video,
				locations: [...video.locations, { id: data.id, name: location.name }].sort((a, b) =>
					a.name.localeCompare(b.name)
				)
			})
		})
	}

	const addAttribute = (attribute: IAttribute) => {
		Axios.post(`${serverConfig.api}/video/${video.id}/attribute`, {
			attributeID: attribute.id
		}).then(({ data }) => {
			update({
				...video,
				attributes: [...video.attributes, { id: data.id, name: attribute.name }].sort((a, b) =>
					a.name.localeCompare(b.name)
				)
			})
		})
	}

	const renameTitle = (title: string) => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { title }).then(() => {
			update({ ...video, name: title })
		})
	}

	const copyTitle = async () => await navigator.clipboard.writeText(video.name)
	const copyStar = async () => await navigator.clipboard.writeText(video.star)

	return (
		<Typography variant='h4' id='header__title'>
			<div className='d-inline-block'>
				<ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
			</div>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Title',
							<TextField
								variant='outlined'
								label='Title'
								defaultValue={video.name}
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										renameTitle(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Rename Title
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Add Attribute',
							attributes
								.filter((item) => {
									const match = video.attributes.some(
										(videoAttribute) => videoAttribute.name === item.name
									)

									if (!match) return item
									return null
								})
								.map((item) => (
									<Button
										variant='outlined'
										color='primary'
										key={item.id}
										onClick={() => {
											handleModal()
											addAttribute(item)
										}}
									>
										{item.name}
									</Button>
								)),
							true
						)
					}}
				>
					<i className={themeConfig.icons.tag} /> Add Attribute
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Add Location',
							locations
								.filter((item) => {
									const match = video.locations.some(
										(videoLocation) => videoLocation.name === item.name
									)

									if (!match) return item
									return null
								})
								.map((item) => (
									<Button
										variant='outlined'
										color='primary'
										key={item.id}
										onClick={() => {
											handleModal()
											addLocation(item)
										}}
									>
										{item.name}
									</Button>
								)),
							true
						)
					}}
				>
					<i className={themeConfig.icons.map} /> Add Location
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={() => copyTitle()}>
					<i className={themeConfig.icons.copy} /> Copy Title
				</MenuItem>

				<MenuItem onClick={() => copyStar()}>
					<i className={themeConfig.icons.user} /> Copy Star
				</MenuItem>
			</ContextMenu>
		</Typography>
	)
}

interface ITimeline {
	video: IVideo
	bookmarks: IVideoBookmark[]
	categories: ICategory[]
	playVideo: any
	duration: number
}
const Timeline = ({ bookmarks, video, playVideo, categories, duration }: ITimeline) => {
	const handleModal = useContext(ModalContext).method
	const update = useContext(UpdateContext).bookmarks

	// Only show warning once
	useEffect(() => {
		if (duration && video.duration) {
			if (Math.abs(duration - video.duration) >= settingsConfig.maxDurationDiff) {
				alert('invalid video-duration')

				console.log('dur', duration)
				console.log('vDur', video.duration)

				console.log('Re-Transcode to fix this issue')
			}
		}
	}, [duration, video.duration])

	const bookmarksArr: HTMLElement[] = []

	const setTime = (id: number) => {
		const player = document.getElementsByTagName('video')[0]

		const time = Math.round(player.currentTime)

		Axios.put(`${serverConfig.api}/bookmark/${id}`, { time }).then(() => {
			update(
				[...bookmarks]
					.map((bookmark) => {
						if (bookmark.id === id) bookmark.start = time

						return bookmark
					})
					.sort((a, b) => a.start - b.start)
			)
		})
	}

	const removeBookmark = (id: number) => {
		Axios.delete(`${serverConfig.api}/bookmark/${id}`).then(() => {
			update([...bookmarks].filter((item: any) => item.id !== id))
		})
	}

	const changeCategory = (category: ICategory, bookmark: IVideoBookmark) => {
		Axios.put(`${serverConfig.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
			update(
				[...bookmarks].map((bookmarkItem) => {
					if (bookmarkItem.id === bookmark.id) bookmarkItem.name = category.name

					return bookmarkItem
				})
			)
		})
	}

	const collisionCheck = (a: any, b: any) => {
		if (a === null || b === null) return false
		if (typeof a === 'undefined' || typeof b === 'undefined') return false

		a = a.getBoundingClientRect()
		b = b.getBoundingClientRect()

		return !(
			a.x + a.width < b.x - settingsConfig.timeline.spacing ||
			a.x + settingsConfig.timeline.spacing > b.x + b.width
		)
	}

	useEffect(() => {
		for (let i = 0, items = bookmarksArr, LEVEL_MIN = 1, LEVEL_MAX = 10, level = LEVEL_MIN; i < items.length; i++) {
			const prePrev = items[i - 2]
			const prev = items[i - 1]
			const current = items[i]

			const collision = collisionCheck(prev, current) || collisionCheck(prePrev, current)
			if (collision && level < LEVEL_MAX) {
				level++
			} else {
				level = LEVEL_MIN
			}

			current.setAttribute('data-level', `${level}`)
		}
	}, [bookmarksArr, useWindowSize])

	return (
		<Grid id='timeline'>
			{bookmarks.length && video.id !== 0
				? bookmarks.map((bookmark, i) => (
						<Fragment key={bookmark.id}>
							<ContextMenuTrigger id={`bookmark-${bookmark.id}`}>
								<Button
									className='bookmark'
									size='small'
									variant='outlined'
									color='primary'
									style={{
										left: `${((bookmark.start * 100) / duration) * settingsConfig.timeline.offset}%`
									}}
									onClick={() => playVideo(bookmark.start)}
									ref={(bookmark: HTMLButtonElement) => (bookmarksArr[i] = bookmark)}
									data-level={1}
								>
									{bookmark.name}
								</Button>
							</ContextMenuTrigger>

							<ContextMenu id={`bookmark-${bookmark.id}`}>
								<MenuItem
									onClick={() => {
										handleModal(
											'Change Category',
											categories
												.filter((category) => category.name !== bookmark.name)
												.map((category) => (
													<Button
														variant='outlined'
														color='primary'
														key={category.id}
														onClick={() => {
															handleModal()
															changeCategory(category, bookmark)
														}}
													>
														{category.name}
													</Button>
												)),
											true
										)
									}}
								>
									<i className={themeConfig.icons.edit} /> Change Category
								</MenuItem>

								<MenuItem onClick={() => setTime(bookmark.id)}>
									<i className={themeConfig.icons.clock} /> Change Time
								</MenuItem>

								<MenuItem divider />

								<MenuItem onClick={() => removeBookmark(bookmark.id)}>
									<i className={themeConfig.icons.trash} /> Delete
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</Grid>
	)
}

interface IVideoPlayer {
	video: IVideo
	categories: ICategory[]
	bookmarks: IVideoBookmark[]
	star: IVideoStar
	playerRef: any
	playerValue: any
	updateDuration: any
}
const VideoPlayer = ({ video, categories, bookmarks, star, playerRef, playerValue, updateDuration }: IVideoPlayer) => {
	const handleModal = useContext(ModalContext).method
	const modalData = useContext(ModalContext).data

	const update = useContext(UpdateContext).video
	const updateStar = useContext(UpdateContext).star
	const updateBookmarks = useContext(UpdateContext).bookmarks

	const [newVideo, setNewVideo] = useState<boolean>()
	const [events, setEvents] = useState(false)

	let playAdded = false

	const getPlayer = () => playerValue?.player

	// Start other Effects
	useEffect(() => {
		if (playerValue !== undefined) {
			if (Number(localStorage.video) === video.id) {
				setNewVideo(false)
			} else {
				setNewVideo(true)
			}
			setEvents(true)
		}
	}, [playerValue])

	// Video Events
	useEffect(() => {
		if (events) {
			const player = getPlayer()

			if (Number(localStorage.video) !== video.id) localStorage.playing = 0

			player.on('timeupdate', () => {
				if (player.currentTime) localStorage.bookmark = Math.round(player.currentTime)
			})
			player.on('play', () => {
				localStorage.playing = 1

				if (newVideo && !playAdded) {
					playAdded = true

					Axios.put(`${serverConfig.api}/video/${video.id}`, { plays: 1 })
						.then(() => {
							console.log('Play Added')
							playAdded = true
						})
						.catch(() => {
							playAdded = false
						})
				}
			})
			player.on('pause', () => (localStorage.playing = 0))
		}
	}, [events])

	// Initialize HLS
	useEffect(() => {
		if (events) {
			const player = getPlayer()

			if (Hls.isSupported() && settingsConfig.hls.enabled) {
				const hls = new Hls({
					autoStartLoad: false,
				})

				hls.loadSource(`${serverConfig.source}/videos/${video.path.stream}`)
				hls.attachMedia(player.media)

				hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
					const dataLevels = data['levels'].length - 1

					const levels: { [key: string]: number } = settingsConfig.hls.levels
					const maxLevel = levels[settingsConfig.hls.maxLevel]
					const maxStartLevel = levels[settingsConfig.hls.maxStartLevel]

					// Default start level to maxLevel-1
					let desiredStartLevel = maxLevel - 1
					// Start level should never be above 720p
					if (desiredStartLevel > maxStartLevel) desiredStartLevel = maxStartLevel
					// Check if desiredStartLevel is too big
					if (desiredStartLevel > dataLevels) desiredStartLevel = dataLevels - 1
					// Check if desiredStartLevel is too small
					if (desiredStartLevel < 0) desiredStartLevel = 0

					hls.startLevel = desiredStartLevel
					hls.autoLevelCapping = maxLevel

					if (!newVideo) {
						hls.startLoad(Number(localStorage.bookmark))

						if (Number(localStorage.playing)) player.play()
					} else {
						localStorage.video = video.id
						localStorage.bookmark = 0

						hls.startLoad()
						player.pause()
					}
				})

				hls.on(Hls.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
			} else {
				player.media.ondurationchange = (e: any) => updateDuration(e.target.duration)
			}
		}
	}, [events])

	const handleWheel = (e: React.WheelEvent) => (getPlayer().currentTime += 10 * Math.sign(e.deltaY) * -1)

	const deleteVideo = () => {
		Axios.delete(`${serverConfig.source}/video/${video.id}`).then(() => {
			window.location.href = '/video'
		})
	}

	const setAge = (age: string) => {
		Axios.get(`${serverConfig.api}/setage.php?videoID=${video.id}&age=${age}`).then(() => {
			updateStar({ ...star, ageInVideo: Number(age) * 365 })
		})
	}

	const addBookmark = (category: ICategory) => {
		const time = Math.round(getPlayer().currentTime)
		if (time) {
			Axios.post(`${serverConfig.api}/video/${video.id}/bookmark`, {
				categoryID: category.id,
				time
			}).then(({ data }) => {
				bookmarks.push({ id: data.id, name: category.name, start: time })

				updateBookmarks([...bookmarks].sort((a, b) => a.start - b.start))
			})
		}
	}

	const clearBookmarks = () => {
		Axios.delete(`${serverConfig.api}/video/${video.id}/bookmark`).then(() => updateBookmarks([]))
	}

	const resetPlays = () => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { plays: 0 }).then(() => {
			update({ ...video, plays: 0 })
		})
	}

	const renameVideo = (path: string) => {
		Axios.put(`${serverConfig.source}/video/${video.id}`, { path }).then(() => {
			window.location.reload()
		})
	}

	const handleKeyPress = (key: string, e: IKeyPress) => {
		if (e.target.tagName === 'INPUT') return
		e.preventDefault()

		const player = getPlayer()
		const volumeConfig = {
			offset: 0.1,
			max: 1,
			min: 0
		}

		switch (key) {
			case 'left':
				player.currentTime -= 1
				break
			case 'right':
				player.currentTime += 1
				break
			case 'space':
				if (player.playing) player.pause()
				else player.play()
				break
			case 'm':
				player.muted = !player.muted
				break
			case 'up':
				player.volume = Math.ceil((player.volume + volumeConfig.offset) * 10) / 10
				break
			case 'down':
				player.volume = Math.floor((player.volume - volumeConfig.offset) * 10) / 10
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	return (
		<div className='video-container' onWheel={handleWheel}>
			<ContextMenuTrigger id='video' holdToDisplay={-1}>
				{video.id !== 0 && (
					<PlyrComponent
						ref={playerRef}
						options={{
							controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'settings'],
							settings: ['speed'],
							speed: { selected: 1, options: [0.5, 1, 1.5, 2] },
							hideControls: false,
							ratio: '21:9',
							keyboard: { focused: false },
							fullscreen: { enabled: false }
						}}
						sources={{
							type: 'video',
							sources: [
								{
									src: `${serverConfig.source}/videos/${video.path.stream}`,
									type: 'application/x-mpegURL'
								},
								{
									src: `${serverConfig.source}/videos/${video.path.file}`,
									type: 'video/mp4'
								}
							],
							poster: `${serverConfig.source}/images/videos/${video.id}.jpg`
						}}
					/>
				)}
			</ContextMenuTrigger>

			<ContextMenu id='video'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Add Bookmark',
							categories.map((category) => (
								<Button
									variant='outlined'
									color='primary'
									key={category.id}
									onClick={() => {
										handleModal()
										addBookmark(category)
									}}
								>
									{category.name}
								</Button>
							)),
							true
						)
					}}
				>
					<i className={themeConfig.icons.add} /> Add Bookmark
				</MenuItem>

				<MenuItem
					disabled={!!star.ageInVideo}
					onClick={() => {
						handleModal(
							'Set Age',
							<TextField
								variant='outlined'
								label='Age'
								type='number'
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										setAge(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.add} /> Set Age
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Rename Video',
							<TextField
								variant='outlined'
								label='File'
								defaultValue={video.path.file}
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										renameVideo(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Rename File
				</MenuItem>

				<MenuItem divider />

				<MenuItem disabled={!bookmarks.length} onClick={clearBookmarks}>
					<i className={themeConfig.icons.trash} /> Remove Bookmarks
				</MenuItem>

				<MenuItem onClick={() => resetPlays()}>
					<i className={themeConfig.icons.trash} /> Remove Plays
				</MenuItem>

				<MenuItem disabled={star.id > 0 || !!bookmarks.length} onClick={deleteVideo}>
					<i className={themeConfig.icons.trash} /> Remove Video
				</MenuItem>
			</ContextMenu>

			<KeyboardEventHandler
				handleKeys={['left', 'right', 'up', 'down', 'space', 'm']}
				onKeyEvent={handleKeyPress}
				handleFocusableElements={true}
				isDisabled={modalData.visible}
			/>
		</div>
	)
}

export default VideoPage
