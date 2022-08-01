import { RefObject } from 'react'

//@ts-ignore
import { PlyrComponent } from 'plyr-react'

import { settings as settingsConfig } from '@/config'

interface PlyrProps {
	playerRef: RefObject<unknown>
	source: string
	poster: string
	thumbnail: string
}
const Plyr = ({ playerRef, source, thumbnail, poster }: PlyrProps) => {
	return (
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
						src: source,
						type: 'video/mp4'
					}
				],
				poster,
				previewThumbnails: {
					enabled: settingsConfig.thumbnails,
					src: thumbnail
				}
			}}
		/>
	)
}

export default Plyr
