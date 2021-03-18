export const isHidden = ({ hidden }: any) => {
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

export const getCount = (obj: any) => {
	let count = obj.length

	obj.forEach(({ hidden }: any) => {
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
