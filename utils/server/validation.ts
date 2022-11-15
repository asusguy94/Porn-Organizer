import Joi from 'joi'
import { NextRequest } from 'next/server'

const validation = (schema: Joi.Schema, body: NextRequest['body']) => {
  const { error, value } = schema.validate(body ?? {})
  if (error) throw new Error(error.details[0].message)

  return value
}

export default validation
