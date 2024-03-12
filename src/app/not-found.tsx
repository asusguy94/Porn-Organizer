'use client'

import { Button, Grid, Typography } from '@mui/material'

import Link from '@/components/link'

export default function NotFound() {
  return (
    <Grid item className='text-center'>
      <Typography variant='h4'>Oops!</Typography>
      <Typography variant='h6'>Seems like this page is not created yet</Typography>

      <Button LinkComponent={Link} href='/' variant='contained' color='primary'>
        Go Back
      </Button>
    </Grid>
  )
}
