import { useState, useEffect } from 'react'

import Axios from 'axios'

import config from '../config.json'

const StarsPage = () => {
	const [stars, setStars] = useState([])
	const [missing, setMissing] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/star/missing`).then(({ data }) => {
			const imported = data.stars.map(item => item.name)

			const filtered = data.missing.filter((star, index, self) => {
				return index === self.findIndex(item => item.name === star.name && !imported.includes(star.name))
			})

			setStars(data.stars)
			setMissing(filtered)
		})
	}, [])

	const handleSubmit = e => {
		e.preventDefault()

		const target = e.target.querySelector('input[type="text"]')
		if (target.value) {
			Axios.post(`${config.api}/star`, { name: target.value }).finally(() => {
				window.location.reload()
			})
		}
	}

	return (
		<div className='col-12 text-center'>
			<div className='stars__missing row mb-4'>
				<div className='col'>
					<form onSubmit={handleSubmit}>
						<input
							type='text'
							className='col-1 px-1'
							defaultValue={missing.length ? missing[0].name : ''}
						/>
						<input type='submit' className='btn btn-primary btn-sm mb-1 ms-1' value='Add Star' />
					</form>
				</div>
			</div>

			<div className='stars__no-image row justify-content-center'>
				{stars.map(star => (
					<a key={star.id} className='col-1' href={`/star/${star.id}`}>
						<div className='card mb-2'>
							{star.image ? (
								<img
									className='card-img-top'
									src={`${config.source}/images/stars/${star.image}`}
									alt='star'
								/>
							) : null}
							<div className='card-body'>{star.name}</div>
						</div>
					</a>
				))}
			</div>
		</div>
	)
}

export default StarsPage
