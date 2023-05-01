import { NextApiRequest } from 'next/types'

import { Server } from 'socket.io'
import { NextApiResponseWithSocket } from '@interfaces/socket'
import { logger } from '@utils/server/helper'

export default function SocketHandler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (res.socket.server.io) {
    console.log('socket.io already initialized')
    res.end()
    return
  }

  res.socket.server.io = new Server(res.socket.server)
  console.log('socket.io initialized')

  res.socket.server.io.on('connection', socket => {
    console.log('socket.io connected')

    socket.on('createdMessage', msg => {
      logger(msg, 'newMessage', res.socket.server.io)
    })

    socket.on('disconnect', () => {
      console.log('socket.io disconnected')
    })
  })

  res.end()
}
