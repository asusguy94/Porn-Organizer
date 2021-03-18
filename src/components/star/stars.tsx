import { useState, useEffect } from 'react'

import Axios from 'axios'

import config from '../config.json'

interface Star {
	id: number
	name: string
	image: string
}
interface MissingStar {
	videoID: number
	name: string
}

const StarsPage = () => {
	const [stars, setStars] = useState<Star[]>([])
	const [missing, setMissing] = useState<MissingStar[]>([])

	useEffect(() => {
		Axios.get(`${config.api}/star/missing`).then(({ data }) => {
			const imported = data.stars.map((item: any) => item.name)

			const filtered = data.missing.filter((star: any, index: any, self: any) => {
				return index === self.findIndex((item: any) => item.name === star.name && !imported.includes(star.name))
			})

			setStars(data.stars)
			setMissing(filtered)
		})
	}, [])

	const handleSubmit = (e: any) => {
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
						<input
							type='submit'
							className='btn btn-primary btn-sm mb-1 ms-1'
							value={`Add Star ${missing.length ? `(1 of ${missing.length})` : ''}`}
						/>
					</form>
				</div>
			</div>

			<div className='stars__no-image row justify-content-center'>
				{stars
					.sort((a: any, b: any) => a.name.localeCompare(b.name))
					.map((star: any) => (
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
