class Indeterminate {
	isIndeterminate(state) {
		return Number(state) === -1
	}

	isChecked(state) {
		return Number(state) === 1
	}

	setChecked(target, value = false) {
		target.checked = value
		target.indeterminate = false

		target.dataset.state = Number(value)
	}

	setIndeterminate(target, value = false) {
		target.indeterminate = value
		target.checked = false

		target.dataset.state = -1
	}

	handleIndeterminate({ target }) {
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
