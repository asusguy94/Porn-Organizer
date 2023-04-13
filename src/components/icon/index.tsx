import { Grid, SvgIconTypeMap } from '@mui/material'
import {
  AccessTimeOutlined,
  AddOutlined,
  BlockOutlined,
  BorderColorOutlined,
  CheckOutlined,
  ContentCopyOutlined,
  DeleteOutline,
  EventAvailableOutlined,
  PersonOutline,
  RoomOutlined,
  SellOutlined,
  SlideshowOutlined,
  SyncOutlined
} from '@mui/icons-material'
import { ContextMenuItem } from 'rctx-contextmenu'

type IconProps = Omit<SvgIconTypeMap['props'], 'children'> & {
  code:
    | 'edit'
    | 'add'
    | 'toggle-no'
    | 'toggle-yes'
    | 'delete'
    | 'copy'
    | 'time'
    | 'calendar'
    | 'film'
    | 'map'
    | 'tag'
    | 'person'
    | 'sync'
  style?: React.CSSProperties
}
export const Icon = ({ code, ...other }: IconProps) => {
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
      return <RoomOutlined {...other} />
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
export const IconWithText = ({ icon: code, text, component, ...other }: IconWithTextProps) => (
  <Grid item component={component} alignItems='center' className='d-flex' {...other}>
    <Icon code={code} style={{ marginRight: 6 }} /> {text}
  </Grid>
)

export default Icon
