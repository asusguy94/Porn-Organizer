import { useState, useEffect } from 'react'

import Axios from 'axios'

import config from '../config.json'

const StarsPage = () => {
	console.log('StarsPage')

	const [stars, setStars] = useState([])
	const [missing, setMissing] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/star/missing`).then(({ data }) => {
			setStars(data.stars)
			setMissing(data.missing)
		})
	}, [])

	// stars without any image
	console.log(stars)

	// required stars
	console.log(missing)

	return null
}

export default StarsPage
