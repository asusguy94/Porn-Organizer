import { NextRequest } from 'next/server'
// import {z} from 'zod'
import { z } from 'zod'

// const joiValidation = (schema: Joi.Schema, body: NextRequest['body']) => {
//   const { error, value } = schema.validate(body ?? {})
//   if (error) throw new Error(error.details[0].message)

//   return value
// }

const zodValidation = <T>(schema: z.ZodType<T>, body: NextRequest['body']) => schema.parse(body)

export default zodValidation
