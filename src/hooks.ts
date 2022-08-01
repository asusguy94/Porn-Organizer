import { useCallback, useState } from 'react'

export const useRefWithEffect = <T>() => {
	const [refValue, setRefValue] = useState<T>()
	const ref = useCallback((node: T) => setRefValue(node), [])

	return [ref, refValue]
}

//TODO must be used with Modal-<Input/>
