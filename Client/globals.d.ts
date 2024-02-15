declare module 'get-video-dimensions' {
  function placeholder(file: string): Promise<{ width: number; height: number }>
  export = placeholder
}

declare module 'ffmpeg-generate-video-preview' {
  type Args = {
    input: string
    output: string
    width?: number
    height?: number
    quality?: number
    numFrames?: number
    numFramesPercent?: number
    rows?: number
    cols?: number
    padding?: number
    margin?: number
    color?: number
    gifski?: {
      fps?: number
      quality?: number
      fast?: boolean
    }
    log?: (message: string) => void
  }

  function placeholder(args: Args): Promise<{
    output: string
    numFrames: number
    width: number
    height: number
    rows: number
    cols: number
  }>
  export = placeholder
}
