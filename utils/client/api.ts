import { serverConfig } from '@config'

const apiUrl = (path: string) => `${serverConfig.api}/${path}`

export default apiUrl
