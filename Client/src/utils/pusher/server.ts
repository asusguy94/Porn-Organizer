import PusherServer from 'pusher'

import { Channel, Message, MessageTypeForKey } from './types'

import { settingsConfig } from '@config'

const socket = new PusherServer({
  appId: settingsConfig.pusher.appId,
  key: settingsConfig.pusher.key,
  secret: settingsConfig.pusher.secret,
  cluster: settingsConfig.pusher.cluster
})

function trigger<K extends keyof Message>(channel_name: Channel, event_name: K, message: MessageTypeForKey<K>) {
  socket.trigger(channel_name, event_name, message)
}

export default { trigger }
