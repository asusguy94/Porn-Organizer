import { Params } from '@interfaces'
import { sendFile } from '@utils/server/helper'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return await sendFile(`./media/vtt/${id}.vtt`)
}
