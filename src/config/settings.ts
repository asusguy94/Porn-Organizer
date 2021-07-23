export default {
	timeline: {
		offset: 0.89,
		spacing: 2
	},
	maxDurationDiff: 1,
	hls: {
		levels: { '2160': 5, '1440': 4, '1080': 3, '720': 2, '468': 1, '360': 0 },
		maxLevel: 720,
		maxStartLevel: 360
	},
	dash: {
		enabled: false,
		levels: { '2160': 5, '1440': 4, '1080': 3, '720': 2, '468': 1, '360': 0 },
		maxLevel: 720,
		maxStartLevel: 480
	},
	modal: {
		filter: {
			search: true,
			startsWithOnTop: true
		}
	}
}
