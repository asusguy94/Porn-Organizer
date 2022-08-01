import { useEffect, useState, useContext } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Grid, Card, CardMedia, Typography, TextField } from '@mui/material'

import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

import Modal from '@components/modal/modal'
import Ribbon, { RibbonContainer } from '@components/ribbon/ribbon'
import Badge from '@components/badge/badge'
import VideoPlayer from '@components/video/video-player'
import Header from '@components/video/header'
import Timeline from '@components/video/timeline'
import Icon from '@components/icon/icon'

import ModalContext from '@/context/modal-context'
import UpdateContext from '@/context/update-context'

import { daysToYears } from '@/date'
import { useRefWithEffect } from '@/hooks'

import { attributeApi, categoryApi, locationApi, videoApi } from '@/api'

import { IAttribute, ILocation, IBookmark as IVideoBookmark, ICategory, IVideo, IVideoStar } from '@/interfaces'

import { server as serverConfig } from '@/config'

import './video.scss'

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
					<div id='stars'>
						<Star video={video} star={star} />

						<StarInput video={video} disabled={star.id !== 0} />
					</div>
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

	if (star.id === 0) return null

	return (
		<div className='star'>
			<RibbonContainer component={Card}>
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
			</RibbonContainer>

			<ContextMenu id='star'>
				<MenuItem onClick={removeStarHandler}>
					<Icon code='trash' /> Remove
				</MenuItem>
			</ContextMenu>
		</div>
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

export default VideoPage
