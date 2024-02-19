import { Params } from '@interfaces'
import { sendFile } from '@utils/server/helper'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return await sendFile(`./media/vtt/${id}.vtt`)
}
