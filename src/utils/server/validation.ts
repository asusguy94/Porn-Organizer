import { NextRequest } from 'next/server'
import { z } from 'zod'

const validate = <T>(schema: z.ZodType<T>, body: NextRequest['body']) => schema.parse(body)

export { z }
export default validate
