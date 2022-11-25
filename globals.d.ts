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
