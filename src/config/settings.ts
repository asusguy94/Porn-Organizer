export default {
	timeline: {
		offset: 0.89,
		spacing: 2
	},
	maxDurationDiff: 1,
	hls: {
		enabled: true,
		levels: { '2160': 5, '1440': 4, '1080': 3, '720': 2, '480': 1, '360': 0 },
		maxLevel: 720,
		maxStartLevel: 360
	},
	modal: {
		filter: {
			search: true,
			startsWithOnTop: true
		}
	}
}
