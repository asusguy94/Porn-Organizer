import React, { Fragment, useEffect, useState, createContext, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Grid, Button, Card, CardMedia, Box, Typography, TextField } from '@mui/material'

import Axios from 'axios'
//@ts-ignore
import { PlyrComponent } from 'plyr-react'
import HlsJS, { ErrorDetails } from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import KeyboardEventHandler from 'react-keyboard-event-handler'

import Modal from '@components/modal/modal'
import Ribbon from '@components/ribbon/ribbon'
import Badge from '@components/badge/badge'
import { daysToYears } from '@components/date/date'
import { useRefWithEffect, useWindowSize } from '@/hooks'

import './video.scss'

import { server as serverConfig, theme as themeConfig, settings as settingsConfig } from '@/config'

import {
	IAttribute,
	ILocation,
	IBookmark as IVideoBookmark,
	ICategory,
	IVideo,
	IVideoStar,
	IBookmark
} from '@/interfaces'
import { attributeApi, categoryApi, locationApi, videoApi } from '@/api'

const UpdateContext = createContext({
	video: (video: IVideo): void => {},
	star: (star: IVideoStar): void => {},
	bookmarks: (bookmarks: IVideoBookmark[]): void => {}
})
const ModalContext = createContext({
	method: (...args: any): void => {},
	data: { visible: false, title: null, data: null, filter: false }
})

const VideoPage = () => {
	const { id } = useParams()

	const [modal, setModal] = useState({
		visible: false,
		title: null,
		data: null,
		filter: false
	})

	const [video, setVideo] = useState({
		id: 0,
		name: '',
		star: '',
		path: {
			file: '',
			stream: '',
			dash: ''
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
	const [categories, setCategories] = useState<ICategory[]>([])
	const [attributes, setAttributes] = useState<IAttribute[]>([])
	const [locations, setLocations] = useState<ILocation[]>([])

	const handleModal = (title = null, data = null, filter = false) => {
		setModal((prevModal) => ({ title, data, visible: !prevModal.visible, filter }))
	}

	useEffect(() => {
		if (id !== undefined) {
			const videoID = parseInt(id)

			videoApi.getVideo<any>(videoID).then(({ data }) => setVideo(data))
			videoApi.getBookmarks<any>(videoID).then(({ data }) => setBookmarks(data))
			videoApi.getStar<any>(videoID).then(({ data }) => setStar(data))
		}

		categoryApi.getAll().then(({ data }) => setCategories(data))
		attributeApi.getAll().then(({ data }) => setAttributes(data))
		locationApi.getAll().then(({ data }) => setLocations(data))
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
		</Grid>
	)
}

interface SectionProps {
	video: IVideo
	locations: ILocation[]
	attributes: IAttribute[]
	categories: ICategory[]
	bookmarks: IVideoBookmark[]
	star: IVideoStar
}
const Section = ({ video, locations, attributes, categories, bookmarks, star }: SectionProps) => {
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

interface StarProps {
	star: IVideoStar
	video: IVideo
}
const Star = ({ star, video }: StarProps) => {
	const update = useContext(UpdateContext).star

	const removeStarHandler = () => {
		videoApi.removeStar(video.id).then(() => {
			update({ ...star, id: 0, name: '' })
		})
	}

	return (
		<>
			{star.id !== 0 ? (
				<Box className='star'>
					<Card className='ribbon-container'>
						<Badge content={star.numVideos}>
							<ContextMenuTrigger id='star'>
								<CardMedia
									component='img'
									src={`${serverConfig.source}/star/${star.id}?${Date.now()}`}
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
						<MenuItem onClick={removeStarHandler}>
							<i className={themeConfig.icons.trash} /> Remove
						</MenuItem>
					</ContextMenu>
				</Box>
			) : null}
		</>
	)
}

interface StarInputProps {
	video: IVideo
	disabled?: boolean
}
const StarInput = ({ video, disabled = false }: StarInputProps) => {
	const update = useContext(UpdateContext).star

	const addStar = (star: string) => {
		videoApi.addStar(video.id, star).then(({ data }) => update(data))
	}

	if (!disabled) {
		return (
			<TextField
				label='Star'
				variant='outlined'
				autoFocus
				onKeyDown={(e) => {
					if (e.key === 'Enter') {
						addStar((e.target as HTMLInputElement).value)
					}
				}}
			/>
		)
	}

	return null
}

interface HeaderProps {
	video: IVideo
	attributes: IAttribute[]
	locations: ILocation[]
	star: IVideoStar
}
const Header = ({ video, attributes, locations, star }: HeaderProps) => {
	const isFullHD = video.height ? video.height > 720 : false

	return (
		<Grid container component='header' id='header'>
			<Grid item>
				<HeaderTitle video={video} attributes={attributes} locations={locations} />

				<HeaderQuality video={video} hidden={!isFullHD} />

				<HeaderDate video={video} star={star} />

				<HeaderLocations video={video} />
				<HeaderAttributes video={video} />

				<HeaderSite video={video} />
			</Grid>
		</Grid>
	)
}

interface HeaderSiteProps {
	video: IVideo
}
const HeaderSite = ({ video }: HeaderSiteProps) => (
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

interface HeaderQualityProps {
	video: IVideo
	hidden?: boolean
}
const HeaderQuality = ({ video, hidden = false }: HeaderQualityProps) => {
	if (hidden) return null

	return (
		<Button size='small' variant='outlined' id='header__quality'>
			<i className={`${themeConfig.icons.film} mr-0`} /> {video.height}
		</Button>
	)
}

interface HeaderLocationsProps {
	video: IVideo
}
const HeaderLocations = ({ video }: HeaderLocationsProps) => {
	const update = useContext(UpdateContext).video

	const removeLocation = (location: ILocation) => {
		Axios.delete(`${serverConfig.api}/location/${video.id}/${location.id}`).then(() => {
			update({ ...video, locations: video.locations.filter((locationItem) => locationItem.id !== location.id) })
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

interface HeaderAttributesProps {
	video: IVideo
}
const HeaderAttributes = ({ video }: HeaderAttributesProps) => {
	const update = useContext(UpdateContext).video

	const removeAttribute = (attribute: IAttribute) => {
		Axios.delete(`${serverConfig.api}/attribute/${video.id}/${attribute.id}`).then(() => {
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

interface HeaderDateProps {
	video: IVideo
	star: IVideoStar
}
const HeaderDate = ({ video, star }: HeaderDateProps) => {
	const { video: update, star: updateStar } = useContext(UpdateContext)

	const fixDate = () => {
		videoApi.fixDate<any>(video.id).then(({ data }) => {
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

interface HeaderTitleProps {
	video: IVideo
	attributes: IAttribute[]
	locations: ILocation[]
}
const HeaderTitle = ({ video, attributes, locations }: HeaderTitleProps) => {
	const handleModal = useContext(ModalContext).method
	const update = useContext(UpdateContext).video

	const addLocationHandler = (location: ILocation) => {
		videoApi.addLocation(video.id, location.id).then(({ data }) => {
			update({
				...video,
				locations: [...video.locations, data].sort((a, b) => {
					return a.name.localeCompare(b.name)
				})
			})
		})
	}

	const addAttribute = (attribute: IAttribute) => {
		videoApi.addAttribute(video.id, attribute.id).then(({ data }) => {
			update({ ...video, attributes: [...video.attributes, data].sort((a, b) => a.name.localeCompare(b.name)) })
		})
	}

	const renameTitle = (title: string) => {
		videoApi.renameTitle(video.id, title).then(() => update({ ...video, name: title }))
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

										renameTitle((e.target as HTMLInputElement).value)
									}
								}}
								className='wide'
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
											addLocationHandler(item)
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

interface TimelineProps {
	video: IVideo
	bookmarks: IVideoBookmark[]
	categories: ICategory[]
	playVideo: any
	duration: number
}
const Timeline = ({ bookmarks, video, playVideo, categories, duration }: TimelineProps) => {
	const handleModal = useContext(ModalContext).method
	const update = useContext(UpdateContext).bookmarks

	// Only show warning once
	useEffect(() => {
		if (duration && video.duration) {
			if (Math.abs(duration - video.duration) >= settingsConfig.maxDurationDiff) {
				alert('invalid video-duration')

				console.log('dur', duration)
				console.log('vDur', video.duration)
				console.log(`difference of ${(video.duration - duration).toFixed(2)}`)

				console.log('')

				console.log('Re-Transcode to fix this issue')
			}
		}
	}, [duration, video.duration])

	const bookmarksArr: HTMLElement[] = []

	const setTime = (bookmark: IBookmark) => {
		const player = document.getElementsByTagName('video')[0]
		const time = Math.round(player.currentTime)

		Axios.put(`${serverConfig.api}/bookmark/${bookmark.id}`, { time }).then(() => {
			update(
				[...bookmarks]
					.map((bookmarkItem) => {
						if (bookmarkItem.id === bookmark.id) {
							bookmarkItem.start = time
						}
						return bookmarkItem
					})
					.sort((a, b) => a.start - b.start)
			)
		})
	}

	const removeBookmark = (bookmark: IBookmark) => {
		Axios.delete(`${serverConfig.api}/bookmark/${bookmark.id}`).then(() => {
			update([...bookmarks].filter((item) => item.start !== bookmark.start))
		})
	}

	const changeCategory = (category: ICategory, bookmark: IVideoBookmark) => {
		Axios.put(`${serverConfig.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
			update(
				[...bookmarks].map((bookmarkItem) => {
					if (bookmarkItem.start === bookmark.start) bookmarkItem.category = category

					return bookmarkItem
				})
			)
		})
	}

	const collisionCheck = (a: HTMLElement, b: HTMLElement) => {
		const aRect = a.getBoundingClientRect()
		const bRect = b.getBoundingClientRect()

		return !(
			aRect.x + aRect.width < bRect.x - settingsConfig.timeline.spacing ||
			bRect.x + settingsConfig.timeline.spacing > bRect.x + bRect.width
		)
	}

	const setDataLevel = (item: HTMLElement, level: number) => {
		if (level > 0) {
			item.setAttribute('data-level', level.toString())
		}
	}

	useEffect(() => {
		for (let i = 1, items = bookmarksArr, LEVEL_MIN = 1, level = LEVEL_MIN; i < items.length; i++) {
			const current = items[i]

			let collision = false
			for (let j = i - 1; !collision && j >= 0; j--) {
				if (collisionCheck(items[j], current)) {
					collision = true
				}
			}

			level = collision ? level + 1 : LEVEL_MIN
			setDataLevel(current, level)
		}
	}, [bookmarksArr, useWindowSize().width])

	return (
		<Grid id='timeline'>
			{bookmarks.length && video.id !== 0
				? bookmarks.map((bookmark, i) => (
						<Fragment key={bookmark.start}>
							<ContextMenuTrigger id={`bookmark-${bookmark.start}`}>
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
									{bookmark.category.name}
								</Button>
							</ContextMenuTrigger>

							<ContextMenu id={`bookmark-${bookmark.start}`}>
								<MenuItem
									onClick={() => {
										handleModal(
											'Change Category',
											categories
												.filter((category) => category.id !== bookmark.category.id)
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

								<MenuItem onClick={() => setTime(bookmark)}>
									<i className={themeConfig.icons.clock} /> Change Time
								</MenuItem>

								<MenuItem divider />

								<MenuItem onClick={() => removeBookmark(bookmark)}>
									<i className={themeConfig.icons.trash} /> Delete
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</Grid>
	)
}

interface VideoPlayerProps {
	video: IVideo
	categories: ICategory[]
	bookmarks: IVideoBookmark[]
	star: IVideoStar
	playerRef: any
	playerValue: any
	updateDuration: any
}
const VideoPlayer = ({
	video,
	categories,
	bookmarks,
	star,
	playerRef,
	playerValue,
	updateDuration
}: VideoPlayerProps) => {
	const handleModal = useContext(ModalContext).method
	const modalData = useContext(ModalContext).data

	const update = useContext(UpdateContext).video
	const updateStar = useContext(UpdateContext).star
	const updateBookmarks = useContext(UpdateContext).bookmarks

	const [newVideo, setNewVideo] = useState<boolean>()
	const [events, setEvents] = useState(false)
	const [fallback, setFallback] = useState(false)

	let playAdded = false

	const getPlayer = () => playerValue?.player

	// Start other Effects
	useEffect(() => {
		if (playerValue !== undefined) {
			if (Number(localStorage.video) === video.id) {
				setNewVideo(false)
			} else {
				setNewVideo(true)
				localStorage.video = video.id
				localStorage.bookmark = 0
			}
			setEvents(true)
		}
	}, [playerValue])

	// Video Events
	useEffect(() => {
		if (events) {
			const player = getPlayer()

			player.on('timeupdate', () => {
				if (player.currentTime > 0) {
					localStorage.bookmark = Math.round(player.currentTime)
				}
			})

			player.on('play', () => {
				if (newVideo && !playAdded) {
					playAdded = true

					videoApi
						.addPlay(video.id)
						.then(() => {
							console.log('Play Added')
							playAdded = true
						})
						.catch(() => {
							playAdded = false
						})
				}
			})
		}
	}, [events])

	// Initialize HLS
	useEffect(() => {
		if (events) {
			const player = getPlayer()

			if (HlsJS.isSupported()) {
				const hls = new HlsJS({
					maxBufferLength: Infinity,
					autoStartLoad: false
				})

				hls.loadSource(`${serverConfig.source}/videos/${video.path.stream}`)
				hls.attachMedia(player.media)

				hls.once(HlsJS.Events.MANIFEST_PARSED, () => {
					if (!newVideo) {
						hls.startLoad(Number(localStorage.bookmark))
					} else {
						hls.startLoad()
					}
				})

				hls.on(HlsJS.Events.ERROR, (e, { details }) => {
					if (details === ErrorDetails.MANIFEST_LOAD_ERROR) {
						setFallback(true)
					}
				})

				hls.on(HlsJS.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
			} else {
				setFallback(true)
			}
		}
	}, [events])

	useEffect(() => {
		if (fallback) {
			const player = getPlayer()

			player.media.src = `${serverConfig.source}/videos/${video.path.file}`
			player.media.ondurationchange = () => updateDuration(player.media.duration)
		}
	}, [fallback])

	const handleWheel = (e: React.WheelEvent) => (getPlayer().currentTime += 10 * Math.sign(e.deltaY) * -1)

	const deleteVideo = () => {
		Axios.delete(`${serverConfig.source}/video/${video.id}`).then(() => {
			window.location.href = '/'
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
				bookmarks.push({ id: data.id, category: { id: category.id, name: category.name }, start: data.start })

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

	const handleKeyPress = (key: string, e: KeyboardEvent) => {
		//@ts-ignore
		if (e.target.tagName === 'INPUT') return

		e.preventDefault()

		const player = getPlayer()
		const volumeConfig = {
			offset: 0.1,
			max: 1,
			min: 0
		}

		const getSeekTime = (multiplier = 1) => 1 * multiplier

		switch (key) {
			case 'left':
				player.currentTime -= getSeekTime()
				break
			case 'right':
				player.currentTime += getSeekTime()
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
							speed: { selected: 1, options: [0.75, 1, 1.25] },
							hideControls: false,
							ratio: '21:9',
							keyboard: { focused: false },
							fullscreen: { enabled: false }
						}}
						sources={{
							type: 'video',
							sources: [
								{
									src: `${serverConfig.source}/videos/${video.path.file}`,
									type: 'video/mp4'
								}
							],
							poster: `${serverConfig.source}/video/${video.id}`,
							previewThumbnails: {
								enabled: settingsConfig.thumbnails,
								src: `${serverConfig.source}/video/${video.id}/vtt`
							}
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

										setAge((e.target as HTMLInputElement).value)
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

										renameVideo((e.target as HTMLInputElement).value)
									}
								}}
								className='wider'
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
