/*TODO re-create this file from scratch
- use more regex with .test() and .match() rather than .split()
- use .at() rather than [] for arrays
*/
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

export function generateTitle(path: string) {
  const file = dirOnly(path)

  return file.split(titleRegex[0])[1]
}

export function generateStarName(path: string) {
  const file = dirOnly(path)

  return file.split(starRegex[0])[1].split(starRegex[1])[0]
}

export function generateDate(path: string) {
  const file = dirOnly(path)

  return file.split(dateRegex[0])[1].split(dateRegex[1])[0]
}

export function generateSite(path: string) {
  const file = dirOnly(path)

  return file.split(siteRegex[0])[1].split(siteRegex[1])[0]
}

export function generateWebsite(path: string) {
  return dirOnly(path)
}
