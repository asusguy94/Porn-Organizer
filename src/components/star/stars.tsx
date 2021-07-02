import { useState, useEffect } from 'react'

import {
	Grid,
	TextField,
	Card,
	CardMedia,
	CardActionArea,
	CardContent,
	Button,
	Link,
	Typography
} from '@material-ui/core'

import Axios from 'axios'

import './stars.scss'

import config from '../config.json'

interface IStar {
	id: number
	name: string
	image: string
}

interface IMissing {
	videoID: number
	name: string
}

const StarsPage = () => {
	const [stars, setStars] = useState<IStar[]>([])
	const [missing, setMissing] = useState<IMissing[]>([])
	const [videoStars, setVideoStars] = useState<IMissing[]>([])
	const [input, setInput] = useState('')

	useEffect(() => {
		Axios.get(`${config.api}/star/missing`).then(({ data }) => {
			const imported = data.stars.map((item: IStar) => item.name)

			const filtered = data.missing.filter((star: IStar, index: any, self: any) => {
				return index === self.findIndex((item: any) => item.name === star.name && !imported.includes(star.name))
			})

			setStars(data.stars)
			setMissing(filtered)
			setVideoStars(data.missing)
		})
	}, [])

	useEffect(() => {
		if (missing.length) setInput(missing[0].name)
	}, [missing])

	const handleSubmit = () => {
		if (input.length) {
			Axios.post(`${config.api}/star`, { name: input }).finally(() => {
				window.location.reload()
			})
		}
	}

	return (
		<Grid container justify='center' spacing={3} id='stars-page'>
			<form noValidate>
				<TextField value={input} onChange={(e) => setInput(e.currentTarget.value)} />

				<Button
					size='small'
					variant='contained'
					color='primary'
					onClick={handleSubmit}
					style={{ marginLeft: 5, marginTop: 1 }}
				>{`Add Star ${missing.length ? `(1 of ${missing.length})` : ''}`}</Button>
			</form>

			<Grid container justify='center' spacing={3} className='stars__no-image'>
				{stars
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((star) => (
						<Grid item key={star.id} lg={1} md={2} xs={3}>
							<Link href={`/star/${star.id}`}>
								<Card className='text-center'>
									<CardActionArea>
										{star.image ? (
											<CardMedia
												src={`${config.source}/images/stars/${star.image}`}
												component='img'
											/>
										) : null}

										<CardContent>
											<Typography>{star.name}</Typography>
										</CardContent>
									</CardActionArea>
								</Card>
							</Link>
						</Grid>
					))}
			</Grid>

			<Grid container justify='center' spacing={3} className='videos__no-star'>
				{videoStars
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((star) => (
						<Grid item key={star.videoID} lg={1} md={2} xs={3}>
							<Card className='text-center'>
								<CardContent>
									<Typography>{star.name}</Typography>

									<CardActionArea>
										<Link href={`/video/${star.videoID}`}>{star.videoID}</Link>
									</CardActionArea>
								</CardContent>
							</Card>
						</Grid>
					))}
			</Grid>
		</Grid>
	)
}

export default StarsPage
