import { FormControlLabel, Radio } from '@mui/material'
import { StarSearch as Star, VideoSearch as Video } from './helper'

type SortObjProps = {
  label: {
    asc: string
    desc: string
  }
  id: string
  callback: (reversed: boolean) => void
  reversed?: boolean
}
const SortObj = ({ id, label, callback, reversed = false }: SortObjProps) => (
  <>
    <FormControlLabel
      label={reversed ? label.desc : label.asc}
      value={id}
      control={<Radio />}
      onChange={() => callback(reversed)}
    />
    <FormControlLabel
      label={reversed ? label.asc : label.desc}
      value={`${id}_reverse`}
      control={<Radio />}
      onChange={() => callback(!reversed)}
    />
  </>
)

export default SortObj
