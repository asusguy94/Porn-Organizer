import { NextPage } from 'next/types'
import { Button, Grid } from '@mui/material'

import Link from '@components/link'

const Error: NextPage = () => (
  <Grid item className='text-center'>
    <h1>Oops!</h1>
    <h3>Seems like this page is not created yet</h3>

    <Button LinkComponent={Link} href='/' variant='contained' color='primary'>
      Go Back
    </Button>
  </Grid>
)

export default Error
