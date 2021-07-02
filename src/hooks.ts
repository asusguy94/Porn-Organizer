import { useCallback, useEffect, useState } from 'react'

export const useRefWithEffect = () => {
	const [refValue, setRefValue] = useState()
	const ref = useCallback((node) => setRefValue(node), [])

	return [ref, refValue]
}

export const setFocus = (input: any) => input && input.focus()

export const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

	useEffect(() => {
		const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })

		// Add event listener
		window.addEventListener('resize', handleResize)

		// Get initial values
		handleResize()

		// Remove event listener
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return windowSize
}

//TODO must be used with Modal-<Input/>
