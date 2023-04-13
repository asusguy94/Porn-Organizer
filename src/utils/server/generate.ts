import { dirOnly } from './helper'

const starRegex: RegExp[] = []
const dateRegex: RegExp[] = []
const titleRegex: RegExp[] = []
const siteRegex: RegExp[] = []

starRegex[0] = /^{\d{4}-\d{2}-\d{2}} \[.*\] /
starRegex[1] = /_.*$/

dateRegex[0] = /^{/
dateRegex[1] = /}/

siteRegex[0] = /^{\d{4}-\d{2}-\d{2}} \[/
siteRegex[1] = /\]/

titleRegex[0] = /^{\d{4}-\d{2}-\d{2}} \[.*\] .*_/

export const generateTitle = (path: string) => {
  const file = dirOnly(path)

  return file.split(titleRegex[0])[1]
}

export const generateStarName = (path: string) => {
  const file = dirOnly(path)

  return file.split(starRegex[0])[1].split(starRegex[1])[0]
}

export const generateDate = (path: string) => {
  const file = dirOnly(path)

  return file.split(dateRegex[0])[1].split(dateRegex[1])[0]
}

export const generateSite = (path: string) => {
  const file = dirOnly(path)

  return file.split(siteRegex[0])[1].split(siteRegex[1])[0]
}
