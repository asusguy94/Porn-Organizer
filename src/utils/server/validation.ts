import { z } from 'zod'

const validate = <T>(schema: z.ZodType<T>, body: unknown) => {
  if (body === undefined) throw new Error('Request-body is undefined')

  let parsedData = body
  if (body instanceof FormData) {
    parsedData = formDataToObject(body)
  }

  const result = schema.safeParse(parsedData)
  if (!result.success) throw new Error(result.error.message)

  return result.data
}

const formDataToObject = (data: FormData): Record<string, unknown> => {
  return Object.fromEntries([...data.entries()])
}

export { z }
export default validate
