import { useState } from 'react'

import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material'

interface IHandler {
	checked: boolean
	indeterminate: boolean
}

const handler = ({ checked, indeterminate }: IHandler) => {
	if (checked) {
		return { indeterminate: true, checked: false }
	} else if (indeterminate) {
		return { indeterminate: false, checked: false }
	} else {
		return { indeterminate: false, checked: true }
	}
}

export const Item = ({
	label,
	value,
	item = null,
	callback
}: {
	label: FormControlLabelProps['label']
	value: any
	item?: any
	callback: any
}) => {
	const [indeterminate, setIndeterminate] = useState(false)
	const [checked, setChecked] = useState(false)

	return (
		<FormControlLabel
			label={label}
			value={value}
			control={
				<Checkbox
					checked={checked}
					indeterminate={indeterminate}
					onChange={() => {
						const result = handler({ checked, indeterminate })

						setIndeterminate(result.indeterminate)
						setChecked(result.checked)

						callback(result, item)
					}}
				/>
			}
		/>
	)
}
