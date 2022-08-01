import { Fragment, useContext } from 'react'

import { Button, Grid, TextField, Typography } from '@mui/material'

import axios from 'axios'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import { useCopyToClipboard } from 'usehooks-ts'

import Icon from '@components/icon/icon'

import UpdateContext from '@/context/update-context'
import ModalContext from '@/context/modal-context'

import { videoApi } from '@/api'

import { IAttribute, ILocation, IVideo, IVideoStar } from '@/interfaces'

import { server as serverConfig } from '@/config'

import styles from './header.module.scss'

interface HeaderProps {
	video: IVideo
	attributes: IAttribute[]
	locations: ILocation[]
	star: IVideoStar
}
const Header = ({ video, attributes, locations, star }: HeaderProps) => {
	const isFullHD = video.height ? video.height > 720 : false

	return (
		<Grid container component='header' id={styles.header}>
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
	<div id={styles.site}>
		<span id={styles.wsite}>{video.website}</span>
		{video.subsite ? (
			<>
				<span className='divider'>-</span>
				<span id={styles.site}>{video.subsite}</span>
			</>
		) : null}
	</div>
)

interface HeaderQualityProps {
	video: IVideo
	hidden?: boolean
}
const HeaderQuality = ({ video, hidden = false }: HeaderQualityProps) => {
	if (hidden) return null

	return (
		<Button size='small' variant='outlined' id={styles.quality}>
			<Icon code='film' className='mr-0' /> {video.height}
		</Button>
	)
}

interface HeaderLocationsProps {
	video: IVideo
}
const HeaderLocations = ({ video }: HeaderLocationsProps) => {
	const update = useContext(UpdateContext).video

	const removeLocation = (location: ILocation) => {
		axios.delete(`${serverConfig.api}/location/${video.id}/${location.id}`).then(() => {
			update({ ...video, locations: video.locations.filter((locationItem) => locationItem.id !== location.id) })
		})
	}

	return (
		<div id={styles.locations}>
			{video.id !== 0
				? video.locations
						.sort((a, b) => a.name.localeCompare(b.name))
						.map((item) => (
							<Fragment key={item.id}>
								<ContextMenuTrigger id={`location-${item.id}`} renderTag='span'>
									<Button size='small' variant='outlined' color='secondary'>
										<Icon code='map' />
										{item.name}
									</Button>
								</ContextMenuTrigger>

								<ContextMenu id={`location-${item.id}`}>
									<MenuItem onClick={() => removeLocation(item)}>
										<Icon code='trash' /> Remove
									</MenuItem>
								</ContextMenu>
							</Fragment>
						))
				: null}
		</div>
	)
}

interface HeaderAttributesProps {
	video: IVideo
}
const HeaderAttributes = ({ video }: HeaderAttributesProps) => {
	const update = useContext(UpdateContext).video

	const removeAttribute = (attribute: IAttribute) => {
		axios.delete(`${serverConfig.api}/attribute/${video.id}/${attribute.id}`).then(() => {
			update({ ...video, attributes: video.attributes.filter((item) => item.id !== attribute.id) })
		})
	}

	return (
		<div id={styles.attributes}>
			{video.id !== 0 &&
				video.attributes
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((item) => (
						<Fragment key={item.id}>
							<ContextMenuTrigger id={`attribute-${item.id}`} renderTag='span'>
								<Button size='small' variant='outlined' color='primary'>
									<Icon code='tag' />
									{item.name}
								</Button>
							</ContextMenuTrigger>

							<ContextMenu id={`attribute-${item.id}`}>
								<MenuItem onClick={() => removeAttribute(item)}>
									<Icon code='trash' /> Remove
								</MenuItem>
							</ContextMenu>
						</Fragment>
					))}
		</div>
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
				<Button size='small' variant='outlined' id={styles.date}>
					<Icon code='calendar' />
					{video.date.published}
				</Button>
			</ContextMenuTrigger>

			<ContextMenu id='menu__date'>
				<MenuItem onClick={() => fixDate()}>
					<Icon code='sync' /> Refresh Date
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
	const [, setClipboard] = useCopyToClipboard()

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

	const copyTitle = async () => await setClipboard(video.name)
	const copyStar = async () => await setClipboard(video.star)

	return (
		<Typography variant='h4' id={styles.title}>
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
					<Icon code='edit' /> Rename Title
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
					<Icon code='tag' /> Add Attribute
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
					<Icon code='map' /> Add Location
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={() => copyTitle()}>
					<Icon code='copy' /> Copy Title
				</MenuItem>

				<MenuItem onClick={() => copyStar()}>
					<Icon code='user' /> Copy Star
				</MenuItem>
			</ContextMenu>
		</Typography>
	)
}

export default Header
