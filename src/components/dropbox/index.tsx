import { useState } from 'react'

import styles from './dropbox.module.css'

type DropboxProps = {
  onDrop: (e: string) => void
}
export default function Dropbox({ onDrop }: DropboxProps) {
  const [hover, setHover] = useState(false)

  const handleDefault = (e: React.DragEvent) => {
    e.stopPropagation()
    e.preventDefault()
  }

  const handleEnter = (e: React.DragEvent) => {
    handleDefault(e)

    setHover(true)
  }

  const handleLeave = (e: React.DragEvent) => {
    handleDefault(e)

    setHover(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    handleDefault(e)

    onDrop(e.dataTransfer.getData('text'))

    setHover(false)
  }

  return (
    <div
      id={styles.dropbox}
      className={`unselectable ${hover ? styles.hover : ''}`}
      onDragEnter={handleEnter}
      onDragOver={handleEnter}
      onDragLeave={handleLeave}
      onDrop={handleDrop}
    >
      <div className={styles.label}>Drop Image Here</div>
    </div>
  )
}
