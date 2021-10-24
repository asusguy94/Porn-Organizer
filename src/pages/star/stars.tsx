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

import { server as serverConfig } from '@/config'

interface IStar {
	id: number
	name: string
	image: string
}

interface IMissing {
	videoID: number
	name: string
}

const IndexChanger = ({ total, index, setIndex }: any) => (
	<span className='mx-1' style={total.length ? {} : { display: 'none' }}>
		<Button
			variant='outlined'
			onClick={() => setIndex(index - 1)}
			disabled={index <= 0}
			style={{ maxHeight: 30, minWidth: 30 }}
		>
			-
		</Button>

		<span className='d-inline-block mx-1' style={{ verticalAlign: 'middle' }}>
			{index}
		</span>

		<Button
			variant='outlined'
			onClick={() => setIndex(index + 1)}
			disabled={index >= total.length - 1}
			style={{ maxHeight: 30, minWidth: 30 }}
		>
			+
		</Button>
	</span>
)

const StarsPage = () => {
	const [stars, setStars] = useState<IStar[]>([])
	const [missing, setMissing] = useState<IMissing[]>([])
	const [videoStars, setVideoStars] = useState<IMissing[]>([])
	const [input, setInput] = useState('')

	const [index, setIndex] = useState(0)

	useEffect(() => {
		Axios.get(`${serverConfig.api}/star/missing`).then(({ data }) => {
			const imported = data.stars.map((item: IStar) => item.name)

			const filtered = data.missing.filter((star: IStar, index: number, self: IMissing[]) => {
				return index === self.findIndex((item) => item.name === star.name && !imported.includes(star.name))
			})

			setStars(data.stars)
			setMissing(filtered)
			setVideoStars(data.missing)
		})
	}, [])

	useEffect(() => {
		if (missing.length) setInput(missing[index].name)
	}, [missing, index])

	const handleSubmit = () => {
		if (input.length) {
			Axios.post(`${serverConfig.api}/star`, { name: input }).finally(() => {
				window.location.reload()
			})
		}
	}

	return (
		<Grid container justifyContent='center' spacing={3} id='stars-page'>
			<form noValidate>
				<TextField value={input} onChange={(e) => setInput(e.currentTarget.value)} />

				<IndexChanger total={missing} index={index} setIndex={setIndex} />

				<Button
					size='small'
					variant='contained'
					color='primary'
					onClick={handleSubmit}
					style={{ marginLeft: 5, marginTop: 1 }}
				>{`Add Star ${missing.length ? `(${index + 1} of ${missing.length})` : ''}`}</Button>
			</form>

			<Grid container justifyContent='center' spacing={3} className='stars__no-image'>
				{stars
					.sort((a, b) => a.name.localeCompare(b.name))
					.map((star) => (
						<Grid item key={star.id} lg={1} md={2} xs={3}>
							<Link href={`/star/${star.id}`}>
								<Card className='text-center'>
									<CardActionArea>
										{star.image ? (
											<CardMedia
												src={`${serverConfig.source}/images/stars/${star.image}`}
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

			<Grid container justifyContent='center' spacing={3} className='videos__no-star'>
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
