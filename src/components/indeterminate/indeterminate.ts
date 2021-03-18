class Indeterminate {
	isIndeterminate(state: string) {
		return Number(state) === -1
	}

	isChecked(state: string) {
		return Number(state) === 1
	}

	setChecked(target: any, value = false) {
		target.checked = value
		target.indeterminate = false

		target.dataset.state = Number(value)
	}

	setIndeterminate(target: any, value = false) {
		target.indeterminate = value
		target.checked = false

		target.dataset.state = -1
	}

	handleIndeterminate({ target }: any) {
		const state = target.dataset.state

		if (this.isChecked(state)) {
			this.setIndeterminate(target, true)
		} else if (this.isIndeterminate(state)) {
			this.setChecked(target)
		} else {
			this.setChecked(target, true)
		}
	}
}

export default Indeterminate
