export type Channel = 'logs' | 'ffmpeg'

type ChannelEvents = {
  logs: 'new-log'
  ffmpeg: 'vtt' | 'generate-star' | 'generate-video' | 'generate-video-info'
}

type ProgressBuffer = { progress: number; buffer?: number }

export type Message = {
  'new-log': { content: string }
  vtt: ProgressBuffer
  'generate-star': ProgressBuffer
  'generate-video': ProgressBuffer
  'generate-video-info': ProgressBuffer
}

type Events = {
  [K in ChannelEvents[keyof ChannelEvents]]: { name: K; callback: (message: Message[K]) => void }
}

export type EventsForChannel<T extends Channel> = Extract<Events[keyof Events], { name: ChannelEvents[T] }>
