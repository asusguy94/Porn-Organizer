import { useEffect, useState } from 'react'
import io from 'socket.io-client'
// import { generateService } from '@service'
import { ClientSocket } from '@interfaces/socket'

let socket: ClientSocket

const MessagePage = () => {
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    fetch('/api/socket').then(() => {
      socket = io()

      socket.on('vtt', log => {
        setLogs(prev => [...prev, log])
      })
    })
  }, [])

  const startTimer = () => {
    // generateService.vtt()
  }

  return (
    <div>
      <button onClick={() => startTimer()}>Start Timer</button>
      <button onClick={() => setLogs([])}>Clear Log</button>

      <textarea value={logs.join('\n')} readOnly />

      <ul>
        {logs.map(log => (
          <li key={log}>{log}</li>
        ))}
      </ul>
    </div>
  )
}

export default MessagePage
