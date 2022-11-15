import { NextApiRequest, NextApiResponse } from 'next/types'

import { getResizedThumb, sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      await sendFile(res, `./media/images/videos/${getResizedThumb(parseInt(id))}`)
    }
  }

  res.status(400)
}
