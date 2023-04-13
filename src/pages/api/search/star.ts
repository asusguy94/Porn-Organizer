import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { dateDiff } from '@utils/server/helper'
import { getUnique } from '@utils/shared'
import { Site, Website } from '@prisma/client'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    /**
     * Returns a site-activity percentage as a decimal
     * @param website the website to compare with
     * @param sites the sites to check
     * @returns a number between 0 and 1
     */
    const calculateSiteScore = (website: Website & { sites: Site[] }, sites: Site[]): number => {
      return sites.filter(s => s.websiteID === website.id).length / website.sites.length
    }

    // highest siteScore is currently 2.6, or 26 when *10
    const calculateScore = (websitesWithSites: (Website & { sites: Site[] })[], sites: Site[]) => {
      const siteScore = websitesWithSites
        .map(website => calculateSiteScore(website, sites) * 10)
        .filter(score => !isNaN(score))
        .reduce((sum, score) => sum + score, 0)

      return siteScore
    }

    res.json(
      (
        await prisma.star.findMany({
          orderBy: { name: 'asc' },
          include: { videos: { include: { website: { include: { sites: true } }, site: true } } }
        })
      ).map(star => {
        const websites = getUnique(
          star.videos.map(({ website }) => website),
          'id'
        )
        const sites = getUnique(
          star.videos.flatMap(({ site }) => (site !== null ? [site] : [])),
          'id'
        )

        return {
          id: star.id,
          name: star.name,
          image: star.image,
          breast: star.breast,
          haircolor: star.haircolor,
          ethnicity: star.ethnicity,
          age: dateDiff(star.birthdate),
          videoCount: star.videos.length,

          score: calculateScore(websites, sites),

          websites: websites.map(w => w.name),
          sites: sites.map(s => s.name)
        }
      })
    )
  }

  res.status(400)
}
