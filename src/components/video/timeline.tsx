import { Fragment, useContext, useEffect } from 'react'

import { Button, Grid } from '@mui/material'

import axios from 'axios'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'

import Icon from '@components/icon/icon'

import ModalContext from '@/context/modal-context'
import UpdateContext from '@/context/update-context'

import { useWindowSize } from 'usehooks-ts'

import { IBookmark, ICategory, IVideo } from '@/interfaces'

import { settings as settingsConfig, server as serverConfig } from '@/config'

import styles from './timeline.module.scss'

interface TimelineProps {
	video: IVideo
	bookmarks: IBookmark[]
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

		axios.put(`${serverConfig.api}/bookmark/${bookmark.id}`, { time }).then(() => {
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
		axios.delete(`${serverConfig.api}/bookmark/${bookmark.id}`).then(() => {
			update([...bookmarks].filter((item) => item.start !== bookmark.start))
		})
	}

	const changeCategory = (category: ICategory, bookmark: IBookmark) => {
		axios.put(`${serverConfig.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
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
		<Grid id={styles.timeline}>
			{bookmarks.length && video.id !== 0
				? bookmarks.map((bookmark, i) => (
						<Fragment key={bookmark.start}>
							<ContextMenuTrigger id={`bookmark-${bookmark.start}`}>
								<Button
									className={styles.bookmark}
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
									<Icon code='edit' /> Change Category
								</MenuItem>

								<MenuItem onClick={() => setTime(bookmark)}>
									<Icon code='clock' /> Change Time
								</MenuItem>

								<MenuItem divider />

								<MenuItem onClick={() => removeBookmark(bookmark)}>
									<Icon code='trash' /> Delete
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</Grid>
	)
}

export default Timeline
