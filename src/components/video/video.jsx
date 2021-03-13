import { Component, Fragment, useEffect, useState, createContext, useContext } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'
import { PlyrComponent } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import KeyboardEventHandler from 'react-keyboard-event-handler'

import Modal from '../modal/modal'
import { DaysToYears } from '../date/date'
import { setFocus, useRefWithEffect } from '../../hooks'

import './video.scss'

import config from '../config.json'

const UpdateContext = createContext({ video: null, star: null, bookmarks: null })
const ModalContext = createContext(null)

class VideoPage extends Component {
	state = {
		video: {
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
		},
		star: {
			id: 0,
			name: '',
			image: '',
			ageInVideo: 0,
			numVideos: 0
		},
		bookmarks: [],
		categories: [],
		attributes: [],
		locations: [],
		modal: {
			visible: false,
			title: null,
			data: null,
			filter: false
		}
	}

	handleKeyPress(key, e) {
		if (e.target === 'INPUT') return
		e.preventDefault()

		if (key === 'tab') {
			window.location.href = this.state.video.nextID ?? '/video'
		} else {
			console.log(`${key} was pressed`)
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
			<div className='video-page col-12 row'>
				<UpdateContext.Provider
					value={{
						video: video => this.setState({ video }),
						star: star => this.setState({ star }),
						bookmarks: bookmarks => this.setState({ bookmarks })
					}}
				>
					<ModalContext.Provider value={(title, data, filter) => this.handleModal(title, data, filter)}>
						<Section
							video={this.state.video}
							locations={this.state.locations}
							attributes={this.state.attributes}
							categories={this.state.categories}
							bookmarks={this.state.bookmarks}
							star={this.state.star}
						/>
					</ModalContext.Provider>

					<aside className='col-2'>
						<div id='stars' className='row justify-content-center'>
							<Star video={this.state.video} star={this.state.star} />
						</div>
					</aside>
				</UpdateContext.Provider>

				<Modal
					visible={this.state.modal.visible}
					title={this.state.modal.title}
					filter={this.state.modal.filter}
					onClose={() => this.handleModal()}
				>
					{this.state.modal.data}
				</Modal>

				<KeyboardEventHandler
					handleKeys={['tab']}
					onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
					handleFocusableElements={true}
				/>
			</div>
		)
	}

	componentDidMount() {
		// Load data
		const { id } = this.props.match.params

		Axios.get(`${config.api}/video/${id}`).then(({ data: video }) => this.setState({ video }))

		Axios.get(`${config.api}/video/${id}/bookmark`).then(({ data: bookmarks }) => this.setState({ bookmarks }))
		Axios.get(`${config.api}/video/${id}/star`).then(({ data: star }) => this.setState({ star }))
		Axios.get(`${config.api}/category`).then(({ data: categories }) => this.setState({ categories }))
		Axios.get(`${config.api}/attribute`).then(({ data: attributes }) => this.setState({ attributes }))
		Axios.get(`${config.api}/location`).then(({ data: locations }) => this.setState({ locations }))
	}
}

const Section = ({ video, locations, attributes, categories, bookmarks, star }) => {
	const [playerRef, ref] = useRefWithEffect()

	// Helper script for getting the player
	const getPlayer = () => ref.player

	const playVideo = (time = null) => {
		const player = getPlayer()

		player.currentTime = time || player.currentTime
		player.play()
	}

	return (
		<section className='col-10'>
			<Header video={video} locations={locations} attributes={attributes} />

			<VideoPlayer
				video={video}
				categories={categories}
				bookmarks={bookmarks}
				star={star}
				playerRef={playerRef}
				playerValue={ref}
			/>

			<Timeline bookmarks={bookmarks} video={video} categories={categories} playVideo={playVideo} />
		</section>
	)
}

const Star = ({ star, video }) => {
	const update = useContext(UpdateContext).star

	const handleBadge = (variation = null) => {
		let data = ''
		const { numVideos } = star

		if (variation === 'data') {
			data = numVideos
		} else if (numVideos) {
			data = `badge-${'x'.repeat(String(numVideos).length)}`
		}

		return data
	}

	const removeStar = () => {
		Axios.delete(`${config.api}/video/${video.id}/star/${star.id}`).then(() => {
			star.id = 0
			star.name = ''

			update(star)
		})
	}

	return (
		<>
			{star.id !== 0 && (
				<div className='star'>
					<div className={`card mb-2 ribbon-container ${handleBadge()}`} data-badge={handleBadge('data')}>
						<ContextMenuTrigger id='star'>
							<img
								className='star__image card-img-top'
								alt='star'
								src={`${config.source}/images/stars/${star.image}`}
							/>

							<Link to={`/star/${star.id}`} className='star__name d-block'>
								{star.name}
							</Link>

							{star.ageInVideo > 0 ? (
								<span className='ribbon'>
									<DaysToYears days={star.ageInVideo} />
								</span>
							) : null}
						</ContextMenuTrigger>
					</div>

					<ContextMenu id='star'>
						<MenuItem onClick={removeStar}>
							<i className={`${config.theme.fa} fa-trash-alt`} /> Remove
						</MenuItem>
					</ContextMenu>
				</div>
			)}
		</>
	)
}

const Header = ({ video, attributes, locations }) => (
	<header className='header row'>
		<div className='col-11'>
			<HeaderTitle video={video} attributes={attributes} locations={locations} />

			<HeaderDate video={video} />

			<HeaderLocations video={video} />

			<HeaderAttributes video={video} />

			<HeaderSite video={video} />
		</div>

		<HeaderNext video={video} />
	</header>
)

const HeaderSite = ({ video }) => (
	<div className='header__site'>
		<span className='wsite'>{video.website}</span>
		{video.subsite ? (
			<>
				<span className='divider'>-</span>
				<span className='site'>{video.subsite}</span>
			</>
		) : null}
	</div>
)

const HeaderNext = ({ video }) => (
	<div className='col-1 header__next'>
		<a className='btn btn-sm btn-outline-primary float-end' id='next' href={`/video/${video.nextID ?? ''}`}>
			Next
		</a>
	</div>
)

const HeaderLocations = ({ video }) => {
	const update = useContext(UpdateContext).video

	const removeLocation = location => {
		Axios.delete(`${config.api}/location/${location.id}`).then(() => {
			video.locations = video.locations.filter(item => item.id !== location.id)

			update(video)
		})
	}

	return (
		<div className='header__locations'>
			{video.id !== 0
				? video.locations.map(item => (
						<Fragment key={item.id}>
							<ContextMenuTrigger id={`location-${item.id}`} renderTag='span'>
								<div className='btn btn-sm btn-outline-danger location'>
									<i className={`${config.theme.fa} fa-map-marker-alt`} />
									{item.name}
								</div>
							</ContextMenuTrigger>

							<ContextMenu id={`location-${item.id}`}>
								<MenuItem onClick={() => removeLocation(item)}>
									<i className={`${config.theme.fa} fa-trash-alt`} /> Remove
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</div>
	)
}

const HeaderAttributes = ({ video }) => {
	const update = useContext(UpdateContext).video

	const removeAttribute = attribute => {
		Axios.delete(`${config.api}/attribute/${attribute.id}`).then(() => {
			video.attributes = video.attributes.filter(item => item.id !== attribute.id)

			update(video)
		})
	}

	return (
		<div className='header__attributes'>
			{video.id !== 0 &&
				video.attributes.map((item, i) => (
					<Fragment key={item.id}>
						<ContextMenuTrigger id={`attribute-${item.id}`} renderTag='span'>
							<div className='btn btn-sm btn-outline-primary attribute'>
								<i className={`${config.theme.fa} fa-tag`} />
								{item.name}
							</div>
						</ContextMenuTrigger>

						<ContextMenu id={`attribute-${item.id}`}>
							<MenuItem onClick={() => removeAttribute(item)}>
								<i className={`${config.theme.fa} fa-trash-alt`} /> Remove
							</MenuItem>
						</ContextMenu>
					</Fragment>
				))}
		</div>
	)
}

const HeaderDate = ({ video }) => {
	const update = useContext(UpdateContext).video

	const fixDate = () => {
		Axios.get(`${config.api}/fixvideodate.php?id=${video.id}`).then(({ data }) => {
			video.date.published = data.date

			update(video)
		})
	}

	return (
		<>
			<ContextMenuTrigger id='menu__date' renderTag='span'>
				<div className='header__date btn btn-sm btn-outline-primary'>
					<i className={`${config.theme.fa} fa-calendar-check`} />
					{video.date.published}
				</div>
			</ContextMenuTrigger>

			<ContextMenu id='menu__date'>
				<MenuItem onClick={() => fixDate()}>
					<i className={`${config.theme.fa} fa-edit`} /> Fix Date
				</MenuItem>
			</ContextMenu>
		</>
	)
}

const HeaderTitle = ({ video, attributes, locations }) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).video

	const addLocation = location => {
		Axios.post(`${config.api}/video/${video.id}/location`, { locationID: location.id }).then(({ data }) => {
			video.locations.push({ id: data.id, name: location.name })
			video.locations.sort((a, b) => a.name.localeCompare(b.name))

			update(video)
		})
	}

	const addAttribute = attribute => {
		Axios.post(`${config.api}/video/${video.id}/attribute`, {
			attributeID: attribute.id
		}).then(({ data }) => {
			video.attributes.push({ id: data.id, name: attribute.name })
			video.attributes.sort((a, b) => a.name.localeCompare(b.name))

			update(video)
		})
	}

	const renameTitle = title => {
		Axios.put(`${config.api}/video/${video.id}`, { title }).then(() => {
			video.name = title

			update(video)
		})
	}

	const copyTitle = async () => await navigator.clipboard.writeText(video.name)
	const copyStar = async () => await navigator.clipboard.writeText(video.star)

	return (
		<h1 className='header__title h2 align-middle'>
			<div className='d-inline-block align-middle'>
				<ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
			</div>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Title',
							<input
								type='text'
								defaultValue={video.name}
								ref={setFocus}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										renameTitle(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} /> Rename Title
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Add Attribute',
							attributes
								.filter(item => {
									const match = video.attributes.some(
										videoAttribute => videoAttribute.name === item.name
									)

									if (!match) return item
									return null
								})
								.map(item => (
									<div
										key={item.id}
										className='btn btn-sm btn-outline-primary d-block'
										onClick={() => {
											handleModal()
											addAttribute(item)
										}}
									>
										{item.name}
									</div>
								)),
							true
						)
					}}
				>
					<i className={`${config.theme.fa} fa-tag`} /> Add Attribute
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Add Location',
							locations
								.filter(item => {
									const match = video.locations.some(
										videoLocation => videoLocation.name === item.name
									)

									if (!match) return item
									return null
								})
								.map(item => (
									<div
										key={item.id}
										className='btn btn-sm btn-outline-primary d-block'
										onClick={() => {
											handleModal()
											addLocation(item)
										}}
									>
										{item.name}
									</div>
								)),
							true
						)
					}}
				>
					<i className={`${config.theme.fa} fa-map-marker-alt`} /> Add Location
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={() => copyTitle()}>
					<i className={`${config.theme.fa} fa-copy`} /> Copy Title
				</MenuItem>

				<MenuItem onClick={() => copyStar()}>
					<i className={`${config.theme.fa} fa-user`} /> Copy Star
				</MenuItem>
			</ContextMenu>
		</h1>
	)
}

const Timeline = ({ bookmarks, video, playVideo, categories }) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).bookmarks

	let bookmarksArr = []

	const setTime = id => {
		const player = document.getElementsByTagName('video')[0]

		const time = Math.round(player.currentTime)

		Axios.put(`${config.api}/bookmark/${id}`, { time }).then(() => {
			bookmarks = bookmarks
				.map(bookmark => {
					if (bookmark.id === id) bookmark.start = time

					return bookmark
				})
				.sort((a, b) => a.start - b.start)

			update(bookmarks)
		})
	}

	const removeBookmark = id => {
		Axios.delete(`${config.api}/bookmark/${id}`).then(() => {
			update(bookmarks.filter(item => item.id !== id))
		})
	}

	const changeCategory = (category, bookmark) => {
		Axios.put(`${config.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
			update(
				bookmarks.map(bookmarkItem => {
					if (bookmarkItem.id === bookmark.id) bookmarkItem.name = category.name

					return bookmarkItem
				})
			)
		})
	}

	const collisionCheck = (a, b) => {
		if (a === null || b === null) return false
		if (typeof a === 'undefined' || typeof b === 'undefined') return false

		a = a.getBoundingClientRect()
		b = b.getBoundingClientRect()

		return !(a.x + a.width < b.x - config.timeline.spacing || a.x + config.timeline.spacing > b.x + b.width)
	}

	useEffect(() => {
		//console.log('#timeline UPDATED')

		for (let i = 1, items = bookmarksArr, LEVEL_MIN = 1, LEVEL_MAX = 10, level = LEVEL_MIN; i < items.length; i++) {
			let collision = false

			const first = items[i - 1]
			const second = items[i]

			// skip if error
			if (first === null || second === null) continue

			if (collisionCheck(first, second)) {
				collision = true
			} else {
				collision = false

				for (let j = 1; j < i; j++) {
					if (collisionCheck(items[j], second)) collision = true
				}
			}

			if (collision && level < LEVEL_MAX) {
				level++
			} else {
				level = LEVEL_MIN
			}

			second.setAttribute('data-level', level)
		}
	}, [bookmarksArr])

	return (
		<div className='col-12' id='timeline'>
			{bookmarks.length && video.id !== 0
				? bookmarks.map((bookmark, i) => (
						<Fragment key={bookmark.id}>
							<ContextMenuTrigger id={`bookmark-${bookmark.id}`}>
								<div
									className='btn btn-sm btn-outline-primary bookmark'
									style={{
										left: `${((bookmark.start * 100) / video.duration) * config.timeline.offset}%`
									}}
									onClick={() => playVideo(bookmark.start)}
									ref={bookmark => (bookmarksArr[i] = bookmark)}
									data-level={1}
								>
									{bookmark.name}
								</div>
							</ContextMenuTrigger>

							<ContextMenu id={`bookmark-${bookmark.id}`}>
								<MenuItem
									onClick={() => {
										handleModal(
											'Change Category',
											categories
												.filter(category => category.name !== bookmark.name)
												.map(category => (
													<div
														key={category.id}
														className='btn btn-sm btn-outline-primary d-block w-auto'
														onClick={() => {
															handleModal()
															changeCategory(category, bookmark)
														}}
													>
														{category.name}
													</div>
												)),
											true
										)
									}}
								>
									<i className={`${config.theme.fa} fa-edit`} /> Change Category
								</MenuItem>

								<MenuItem onClick={() => setTime(bookmark.id)}>
									<i className={`${config.theme.fa} fa-clock`} /> Change Time
								</MenuItem>

								<MenuItem divider />

								<MenuItem onClick={() => removeBookmark(bookmark.id)}>
									<i className={`${config.theme.fa} fa-trash-alt`} /> Delete
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</div>
	)
}

const VideoPlayer = ({ video, categories, bookmarks, star, playerRef, playerValue }) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).video
	const updateStar = useContext(UpdateContext).star
	const updateBookmarks = useContext(UpdateContext).bookmarks

	const [newVideo, setNewVideo] = useState()
	const [events, setEvents] = useState(false)

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

				if (newVideo) {
					Axios.put(`${config.api}/video/${video.id}`, { plays: 1 }).then(() => {
						console.log('Play Added')
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

			if (Hls.isSupported() && config.hls.enabled) {
				const hls = new Hls({ autoStartLoad: false })
				hls.loadSource(`${config.source}/videos/${video.path.stream}`)
				hls.attachMedia(player.media)

				hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
					const dataLevels = data['levels'].length - 1

					const levels = config.hls.levels
					const maxLevel = levels[config.hls.maxLevel]
					const maxStartLevel = levels[config.hls.maxStartLevel]

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
			}
		}
	}, [events])

	const handleWheel = e => (getPlayer().currentTime += 10 * Math.sign(e.deltaY) * -1)

	const deleteVideo = () => {
		Axios.delete(`${config.source}/video/${video.id}`).then(() => {
			window.location.href = '/video'
		})
	}

	const setAge = age => {
		Axios.get(`${config.api}/setage.php?videoID=${video.id}&age=${age}`).then(() => {
			star.ageInVideo = Number(age) * 365

			updateStar(star)
		})
	}

	const addBookmark = category => {
		const time = Math.round(getPlayer().currentTime)
		if (time) {
			Axios.post(`${config.api}/video/${video.id}/bookmark`, {
				categoryID: category.id,
				time
			}).then(({ data }) => {
				bookmarks.push({ id: data.id, name: category.name, start: time })
				bookmarks.sort((a, b) => a.start - b.start)

				updateBookmarks(bookmarks)
			})
		}
	}

	const clearBookmarks = () => {
		Axios.delete(`${config.api}/video/${video.id}/bookmark`).then(() => updateBookmarks([]))
	}

	const resetPlays = () => {
		Axios.put(`${config.api}/video/${video.id}`, { plays: 0 }).then(() => {
			video.plays = 0
			update(video)
		})
	}

	const renameVideo = path => {
		Axios.put(`${config.source}/video/${video.id}`, { path }).then(() => {
			window.location.reload()
		})
	}

	const handleKeyPress = (key, e) => {
		if (e.target.tagName === 'INPUT') return
		e.preventDefault()

		const player = getPlayer()

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
							controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
							hideControls: false,
							ratio: '21:9',
							keyboard: { focused: false }
						}}
						sources={{
							type: 'video',
							sources: [
								{
									src: `${config.source}/videos/${video.path.file}`,
									type: 'video/mp4'
								}
							]
						}}
					/>
				)}
			</ContextMenuTrigger>

			<ContextMenu id='video'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Add Bookmark',
							categories.map(category => (
								<div
									key={category.id}
									className='btn btn-sm btn-outline-primary d-block'
									onClick={() => {
										handleModal()
										addBookmark(category)
									}}
								>
									{category.name}
								</div>
							)),
							true
						)
					}}
				>
					<i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
				</MenuItem>

				<MenuItem
					disabled={!!star.ageInVideo}
					onClick={() => {
						handleModal(
							'Set Age',
							<input
								type='number'
								ref={setFocus}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										setAge(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-plus`} /> Set Age
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Rename Video',
							<input
								type='text'
								defaultValue={video.path.file}
								ref={setFocus}
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										renameVideo(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} /> Rename File
				</MenuItem>

				<MenuItem disabled>
					<i className={`${config.theme.fa} fa-edit`} /> Fix Thumbnails
				</MenuItem>

				<MenuItem divider />

				<MenuItem disabled={!bookmarks.length} onClick={clearBookmarks}>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Bookmarks
				</MenuItem>

				<MenuItem onClick={() => resetPlays()}>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Plays
				</MenuItem>

				<MenuItem disabled={star.id > 0 || !!bookmarks.length} onClick={deleteVideo}>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Video
				</MenuItem>
			</ContextMenu>

			<KeyboardEventHandler
				handleKeys={['left', 'right', 'space', 'm']}
				onKeyEvent={(key, e) => handleKeyPress(key, e)}
				handleFocusableElements={true}
			/>
		</div>
	)
}

export default VideoPage
