declare module 'react-contextmenu' {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ContextMenuProps {
    children: React.ReactNode
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface ContextMenuTriggerProps {
    children: React.ReactNode
  }

  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface MenuItemProps {
    children?: React.ReactNode
  }
}

declare module 'get-video-dimensions' {
  function placeholder(file: string): Promise<{ width: number; height: number }>
  export = placeholder
}
