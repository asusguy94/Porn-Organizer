import { Params } from '@interfaces'
import { getResizedThumb, sendFile } from '@utils/server/helper'

//NEXT /star/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return await sendFile(`./media/images/videos/${getResizedThumb(id)}`)
}
