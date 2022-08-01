import { useState, useEffect } from 'react'

import { Grid, TextField, Card, CardMedia, CardActionArea, CardContent, Button, Link, Typography } from '@mui/material'

import { useLocalStorage } from 'usehooks-ts'

import { starApi } from '@/api'

import { IGeneral } from '@/interfaces'

import { server as serverConfig } from '@/config'

interface IStar extends IGeneral {
	image: string | null
}

interface IMissing {
	videoID: number
	name: string
}

interface IIndexChanger {
	total: IMissing[]
	index: number
	setIndex: (index: number) => void
}
const IndexChanger = ({ total, index, setIndex }: IIndexChanger) => (
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
	const [starInput, setStarInput] = useLocalStorage('starInput', '')

	const [stars, setStars] = useState<IStar[]>([])
	const [missing, setMissing] = useState<IMissing[]>([])
	const [videoStars, setVideoStars] = useState<IMissing[]>([])
	const [input, setInput] = useState('')
	const [activeStar, setActiveStar] = useState<string>()

	const [index, setIndex] = useState(0)

	useEffect(() => {
		starApi.getMissing<IMissing, IStar>().then(({ data }) => {
			const imported = data.stars.map((item) => item.name)

			const filtered = data.missing.filter((star, idx, self) => {
				return idx === self.findIndex((item) => item.name === star.name && !imported.includes(star.name))
			})

			setStars(data.stars)
			setMissing(filtered)
			setVideoStars(data.missing)
		})
	}, [])

	useEffect(() => {
		if (missing.length) setInput(missing[index].name)
	}, [missing, index])

	useEffect(() => {
		setActiveStar(stars.find((s) => s.name === starInput)?.name)
	}, [stars])

	const handleSubmit = () => {
		if (input.length) {
			setStarInput(input)
			starApi.addStar(input).finally(() => {
				window.location.reload()
			})
		}
	}

	return (
		<Grid container justifyContent='center'>
			<form noValidate onSubmit={handleSubmit}>
				<TextField variant='standard' value={input} onChange={(e) => setInput(e.currentTarget.value)} />

				<IndexChanger total={missing} index={index} setIndex={setIndex} />

				<Button
					size='small'
					variant='contained'
					color='primary'
					type='submit'
					style={{ marginLeft: 5, marginTop: 1 }}
				>{`Add Star ${missing.length ? `(${index + 1} of ${missing.length})` : ''}`}</Button>
			</form>

			<Grid container justifyContent='center' spacing={3} style={{ marginTop: 0 }}>
				{stars
					.sort((a, b) => a.name.localeCompare(b.name))
					.slice(0, 1000) // limit results to avoid crash
					.map((star) => (
						<Grid item key={star.id} lg={1} md={2} xs={3}>
							<Link href={`/star/${star.id}`}>
								<Card className='text-center'>
									<CardActionArea>
										{star.image ? (
											<CardMedia src={`${serverConfig.source}/star/${star.id}`} component='img' />
										) : null}

										<CardContent
											style={activeStar === star.name ? { backgroundColor: 'orange' } : {}}
										>
											<Typography>{star.name}</Typography>
										</CardContent>
									</CardActionArea>
								</Card>
							</Link>
						</Grid>
					))}
			</Grid>

			<Grid container justifyContent='center' spacing={3}>
				{videoStars
					.sort((a, b) => a.name.localeCompare(b.name))
					.slice(0, 1000) // limit results to avoid crash
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
