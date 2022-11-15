import { NextApiRequest, NextApiResponse } from 'next/types'

import { sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      await sendFile(res, `./media/vtt/${id}.jpg`)
    }
  }

  res.status(400)
}
