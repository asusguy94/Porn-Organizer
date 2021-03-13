import { useCallback, useState } from 'react'

export const useRefWithEffect = () => {
	const [refValue, setRefValue] = useState()
	const ref = useCallback(node => setRefValue(node), [])

	return [ref, refValue]
}

export const setFocus = input => input && input.focus()

//TODO must be used with Modal-<Input/>
