export type Channel = 'logs' | 'ffmpeg'

type ProgressBuffer = { progress: number; buffer?: number }

export type Message = {
  'new-log': { content: string }
  vtt: ProgressBuffer
  'generate-star': ProgressBuffer
  'generate-video': ProgressBuffer
  'generate-video-info': ProgressBuffer
}

export type MessageTypeForKey<K extends keyof Message> = Message[K]
