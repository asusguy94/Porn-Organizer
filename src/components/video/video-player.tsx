import { useContext, useEffect, useState } from 'react'

import { Button, TextField } from '@mui/material'

import Hls, { ErrorDetails } from 'hls.js'
import axios from 'axios'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import { useLocalStorage } from 'usehooks-ts'

import Plyr from '@components/plyr/plyr'
import Icon from '@components/icon/icon'

import { IBookmark, ICategory, IVideo, IVideoStar } from '@/interfaces'

import ModalContext from '@/context/modal-context'
import UpdateContext from '@/context/update-context'

import { videoApi } from '@/api'

import { server as serverConfig } from '@/config'

interface VideoPlayerProps {
	video: IVideo
	categories: ICategory[]
	bookmarks: IBookmark[]
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
	const [localVideo, setLocalVideo] = useLocalStorage('video', 0)
	const [localBookmark, setLocalBookmark] = useLocalStorage('bookmark', 0)

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
			if (localVideo === video.id) {
				setNewVideo(false)
			} else {
				setNewVideo(true)
				setLocalVideo(video.id)
				setLocalBookmark(0)
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
					setLocalBookmark(Math.round(player.currentTime))
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

			if (Hls.isSupported()) {
				const hls = new Hls({
					maxBufferLength: Infinity,
					autoStartLoad: false
				})

				hls.loadSource(`${serverConfig.source}/videos/${video.path.stream}`)
				hls.attachMedia(player.media)

				hls.once(Hls.Events.MANIFEST_PARSED, () => {
					if (!newVideo) {
						hls.startLoad(localBookmark)
					} else {
						hls.startLoad()
					}
				})

				hls.on(Hls.Events.ERROR, (e, { details }) => {
					if (details === ErrorDetails.MANIFEST_LOAD_ERROR) {
						setFallback(true)
					}
				})

				hls.on(Hls.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
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
		axios.delete(`${serverConfig.source}/video/${video.id}`).then(() => {
			window.location.href = '/'
		})
	}

	const setAge = (age: string) => {
		axios.get(`${serverConfig.api}/setage.php?videoID=${video.id}&age=${age}`).then(() => {
			updateStar({ ...star, ageInVideo: Number(age) * 365 })
		})
	}

	const addBookmark = (category: ICategory) => {
		const time = Math.round(getPlayer().currentTime)
		if (time) {
			axios
				.post(`${serverConfig.api}/video/${video.id}/bookmark`, {
					categoryID: category.id,
					time
				})
				.then(({ data }) => {
					bookmarks.push({
						id: data.id,
						category: { id: category.id, name: category.name },
						start: data.start
					})

					updateBookmarks([...bookmarks].sort((a, b) => a.start - b.start))
				})
		}
	}

	const clearBookmarks = () => {
		axios.delete(`${serverConfig.api}/video/${video.id}/bookmark`).then(() => updateBookmarks([]))
	}

	const resetPlays = () => {
		axios.put(`${serverConfig.api}/video/${video.id}`, { plays: 0 }).then(() => {
			update({ ...video, plays: 0 })
		})
	}

	const renameVideo = (path: string) => {
		axios.put(`${serverConfig.source}/video/${video.id}`, { path }).then(() => {
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
					<Plyr
						playerRef={playerRef}
						source={`${serverConfig.source}/videos/${video.path.file}`}
						poster={`${serverConfig.source}/video/${video.id}`}
						thumbnail={`${serverConfig.source}/video/${video.id}/vtt`}
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
					<Icon code='add' /> Add Bookmark
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
					<Icon code='add' /> Set Age
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
					<Icon code='edit' /> Rename File
				</MenuItem>

				<MenuItem divider />

				<MenuItem disabled={!bookmarks.length} onClick={clearBookmarks}>
					<Icon code='trash' /> Remove Bookmarks
				</MenuItem>

				<MenuItem onClick={() => resetPlays()}>
					<Icon code='trash' /> Remove Plays
				</MenuItem>

				<MenuItem disabled={star.id > 0 || !!bookmarks.length} onClick={deleteVideo}>
					<Icon code='trash' /> Remove Video
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

export default VideoPlayer
