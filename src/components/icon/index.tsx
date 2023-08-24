import {
  AccessTimeOutlined,
  AddLocationAltOutlined,
  AddOutlined,
  BlockOutlined,
  BorderColorOutlined,
  CheckOutlined,
  ContentCopyOutlined,
  DeleteOutline,
  EventAvailableOutlined,
  LocationOnOutlined,
  PersonOutline,
  SellOutlined,
  SlideshowOutlined,
  SyncOutlined
} from '@mui/icons-material'
import { Grid, SvgIconTypeMap } from '@mui/material'

import { ContextMenuItem } from 'rctx-contextmenu'

type Toggle = 'toggle-no' | 'toggle-yes'
type Map = 'map' | 'add-map'
type Basic = 'add' | 'edit' | 'delete'

type IconProps = Omit<SvgIconTypeMap['props'], 'children'> & {
  code: Basic | Toggle | Map | 'copy' | 'time' | 'calendar' | 'film' | 'tag' | 'person' | 'sync'
  style?: React.CSSProperties
}
export default function Icon({ code, ...other }: IconProps) {
  switch (code) {
    case 'edit':
      return <BorderColorOutlined {...other} />
    case 'add':
      return <AddOutlined {...other} />
    case 'toggle-yes':
      return <CheckOutlined {...other} />
    case 'toggle-no':
      return <BlockOutlined {...other} />
    case 'delete':
      return <DeleteOutline {...other} />
    case 'copy':
      return <ContentCopyOutlined {...other} />
    case 'time':
      return <AccessTimeOutlined {...other} />
    case 'calendar':
      return <EventAvailableOutlined {...other} />
    case 'film':
      return <SlideshowOutlined {...other} />
    case 'map':
      return <LocationOnOutlined {...other} />
    case 'add-map':
      return <AddLocationAltOutlined {...other} />
    case 'tag':
      return <SellOutlined {...other} />
    case 'person':
      return <PersonOutline {...other} />
    case 'sync':
      return <SyncOutlined {...other} />
  }
}

type IconWithTextProps = Omit<ContextMenuItem, 'className' | 'children'> & {
  icon: IconProps['code']
  text: string
  component: React.ElementType
}
export function IconWithText({ icon: code, text, component, ...other }: IconWithTextProps) {
  return (
    <Grid item component={component} alignItems='center' className='d-flex' {...other}>
      <Icon code={code} style={{ marginRight: 6 }} /> {text}
    </Grid>
  )
}
