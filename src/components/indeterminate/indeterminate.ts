export const handler = ({ checked, indeterminate }: any) => {
	if (checked) {
		return { indeterminate: true, checked: false }
	} else if (indeterminate) {
		return { indeterminate: false, checked: false }
	}

		return { indeterminate: false, checked: true }
	}
