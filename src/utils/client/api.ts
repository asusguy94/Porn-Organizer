import { serverConfig } from '@/config'

// TODO this will be used soon
export default function apiUrl(path: string) {
  return `${serverConfig.api}/${path}`
}
