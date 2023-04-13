import { NextRequest } from 'next/server'
import { z } from 'zod'

const zodValidation = <T>(schema: z.ZodType<T>, body: NextRequest['body']) => schema.parse(body)

export { z }
export default zodValidation
