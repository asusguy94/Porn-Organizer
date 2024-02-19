import { Site, Website } from '@prisma/client'
import { dateDiff } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  /**
   * Returns a site-activity percentage as a decimal
   * @param website the website to compare with
   * @param sites the sites to check
   * @returns a number between 0 and 1
   */
  function calculateSiteScore(website: Website & { sites: Site[] }, sites: Site[]): number {
    return sites.filter(site => site.websiteID === website.id).length / website.sites.length
  }

  // highest siteScore is currently 2.6, or 26 when *10
  //TODO currently a star with 1 site and 1 video is scored the same as a star with 1 site and 2 videos
  function calculateScore(websitesWithSites: (Website & { sites: Site[] })[], sites: Site[]) {
    return websitesWithSites
      .map(website => calculateSiteScore(website, sites) * 10)
      .filter(score => !isNaN(score))
      .reduce((sum, score) => sum + score, 0)
  }

  return Response.json(
    (
      await db.star.findMany({
        orderBy: { name: 'asc' },
        include: { videos: { include: { website: { include: { sites: true } }, site: true } }, haircolors: true }
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
        haircolor: star.haircolors.map(haircolor => haircolor.hair),
        ethnicity: star.ethnicity,
        age: dateDiff(star.birthdate),
        videoCount: star.videos.length,
        score: calculateScore(websites, sites),
        websites: websites.map(website => website.name),
        sites: sites.map(site => site.name)
      }
    })
  )
}
