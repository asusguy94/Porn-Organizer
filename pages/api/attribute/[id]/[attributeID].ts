import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id: videoID, attributeID } = req.query

    if (typeof videoID === 'string' && typeof attributeID === 'string') {
      await prisma.videoAttributes.delete({
        where: { attributeID_videoID: { videoID: parseInt(videoID), attributeID: parseInt(attributeID) } }
      })

      res.end()
    }
  }

  res.status(400)
}
