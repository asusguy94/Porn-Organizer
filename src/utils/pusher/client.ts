import PusherClient, { Channel as PusherChannel } from 'pusher-js'

import { Channel, EventsForChannel } from './types'

import { settingsConfig } from '@config'

const socket = new PusherClient(settingsConfig.pusher.key, {
  cluster: settingsConfig.pusher.cluster
})

function subscribe<T extends Channel>(channel_name: T, event: EventsForChannel<T>) {
  return socket.subscribe(channel_name).bind(event.name, event.callback)
}

function unsubscribe(channel: PusherChannel) {
  channel.unbind_all().unsubscribe()
}

export default { subscribe, unsubscribe }
