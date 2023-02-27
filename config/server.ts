import { getValue } from '@config'

export default {
  api: '/api',
  db: getValue('NEXT_PUBLIC_DB_ADMIN', '/db')
}
