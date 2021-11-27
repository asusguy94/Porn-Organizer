import { Link } from 'react-router-dom'

import { Button, Grid } from '@mui/material'

const ErrorPage = () => (
	<Grid item id='error-page' className='text-center'>
		<h1>Oops!</h1>
		<h3>Seems like this page is not created yet</h3>

		<Link to='/'>
			<Button variant='contained' color='primary'>
				Go Back
			</Button>
		</Link>
	</Grid>
)

export default ErrorPage
