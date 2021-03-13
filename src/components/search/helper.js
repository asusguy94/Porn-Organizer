export const isHidden = ({ hidden }) => {
	let value = 0
	for (var prop in hidden) {
		if (typeof hidden[prop] !== 'object') {
			value += Number(hidden[prop])
		} else {
			value += Number(hidden[prop].length > 0)
		}
	}

	return value
}

export const getCount = obj => {
	let count = obj.length

	obj.forEach(({ hidden }) => {
		let value = 0
		for (const prop in hidden) {
			if (typeof hidden[prop] !== 'object') {
				value += Number(hidden[prop])
			} else {
				value += Number(hidden[prop].length > 0)
			}
		}
		if (value) count--
	})
	return count
}
