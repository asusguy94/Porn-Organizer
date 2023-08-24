import { serverConfig } from '@config'

export default function apiUrl(path: string) {
  return `${serverConfig.api}/${path}`
}
