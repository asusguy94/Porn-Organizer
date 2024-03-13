type ErrorProps = {
  error: Error
}

export default function Error({ error }: ErrorProps) {
  return (
    <div>
      <h1>{error.message}</h1>
      <pre>{error.stack}</pre>
    </div>
  )
}
