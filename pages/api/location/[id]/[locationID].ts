import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id: videoID, locationID } = req.query

    if (typeof videoID === 'string' && typeof locationID === 'string') {
      await prisma.videoLocations.delete({
        where: { locationID_videoID: { videoID: parseInt(videoID), locationID: parseInt(locationID) } }
      })

      res.end()
    }
  }

  res.status(400)
}
