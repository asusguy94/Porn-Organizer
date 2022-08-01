import React from 'react'

import { IBookmark, IVideo, IVideoStar } from '@/interfaces'

const UpdateContext = React.createContext({
	video: (video: IVideo): void => {},
	star: (star: IVideoStar): void => {},
	bookmarks: (bookmarks: IBookmark[]): void => {}
})

interface ContextProvider {
	onVideo?: (video: IVideo) => void
	onStar?: (video: IVideoStar) => void
	onBookmarks?: (bookmarks: IBookmark) => void
	children: React.ReactNode
}
export const ModalContextProvider = ({ onVideo, onStar, onBookmarks, children }: ContextProvider) => {
	// return (
	// 	<UpdateContext.Provider
	// 		value={{video: onVideo, star: onStar, bookmarks: onBookmarks} }
	// 	>
	// 		{children}
	// 	</UpdateContext.Provider>
	// )
}

export default UpdateContext
