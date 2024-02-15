import { Grid, LinearProgress, Typography } from '@mui/material'

type ProgressProps = { label: string; value: number; buffer?: number }

export default function Progress({ label, value, buffer }: ProgressProps) {
  return (
    <Grid container justifyContent='center'>
      <Grid container item xs={4} alignItems='center' padding='0.5em'>
        <Typography variant='caption'>{label}</Typography>

        <Grid item xs={11}>
          <LinearProgress variant='determinate' value={value} valueBuffer={buffer} />
        </Grid>

        <Grid item xs={1}>
          <Typography variant='body2' color='text.secondary'>
            {value} %
          </Typography>
        </Grid>
      </Grid>
    </Grid>
  )
}
