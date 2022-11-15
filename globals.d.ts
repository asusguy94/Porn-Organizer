declare module 'react-contextmenu' {
  interface ContextMenuProps {
    children: React.ReactNode
  }

  interface ContextMenuTriggerProps {
    children: React.ReactNode
  }

  interface MenuItemProps {
    children?: React.ReactNode
  }
}

declare module 'get-video-dimensions' {
  function placeholder(file: string): Promise<{ width: number; height: number }>
  export = placeholder
}

declare module 'ffmpeg-extract-frame' {
  interface IArgs {
    input: string
    output: string
    offset?: number
    quality?: number
    log?: (message: string) => void
  }

  function placeholder(args: IArgs): Promise<void>
  export = placeholder
}
