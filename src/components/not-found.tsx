import { Button, Grid, Typography } from '@mui/material'

import { Link } from '@tanstack/react-router'

export default function NotFound() {
  return (
    <Grid item className='text-center'>
      <Typography variant='h4'>Oops!</Typography>
      <Typography variant='h6'>Seems like this page is not created yet</Typography>

      <Link to='/'>
        <Button variant='contained' color='primary'>
          Go Back
        </Button>
      </Link>
    </Grid>
  )
}
