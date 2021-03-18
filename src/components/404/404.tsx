import { Link } from 'react-router-dom'

const ErrorPage = () => (
	<div id='error-page' className='col text-center'>
		<h1>Oops!</h1>
		<h3>Seems like this page is not created yet</h3>

		<Link className='btn btn-primary mt-4' to='/'>
			Go Back
		</Link>
	</div>
)

export default ErrorPage
