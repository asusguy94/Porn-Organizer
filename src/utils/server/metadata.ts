import axios, { AxiosRequestConfig } from 'axios'

import { toCamelCase } from './helper'
import { getUnique } from '../shared'

import { settingsConfig } from '@config'
import { Extra, Gender, Performer } from '@interfaces'

type BasicModel = {
  data: {
    id: string
    slug: string
    name: string
    extras: Extra & {
      gender: Gender
      birthplace: string | null
      birthplace_code: string | null
      hair_colour: string | null
    }
    image: string
    thumbnail: string
    posters: {
      id: number
      url: string
    }[]
  }[]
}

//TODO Check if title.toLowerCase() matches videodata.title.toLowercase()

const config: AxiosRequestConfig = {
  headers: { Authorization: `Bearer ${settingsConfig.THEPORNDB_API}` },
  timeout: 5 * 1000 // 5 seconds timeout
}

const SERVER_ERROR = 'Server might be down'

const inToCm = (cm: number) => Math.round(cm * 2.54)
const lbsToKg = (lbs: number) => Math.round(lbs * 0.45359237)
const getCupSize = (input: string) => input.match(/[A-Z]+$/i)?.[0] ?? null

const getUrl = (path = '') => new URL(`https://api.metadataapi.net${path}`)

export const getSceneSlug = async (slug: string): Promise<string> => {
  type Scene = {
    data: { id: string }
  }

  const url = getUrl(`/scenes/${slug}`)

  const result = (await axios.get<Scene>(url.href, config)).data

  // TODO find out if this ever throws?
  return Promise.resolve(result.data.id)
}

//FIXME outdated?
// sometimes scenes are only found using site (not wsite) >> "Reality Kings"?
// sometimes scenes are only found using wsite (not site) >> "Lets Doe It"
// test solution by limiting the loop by video-id
export async function findSceneSlug(videoStar: string, videoTitle: string, siteOrWsite: string): Promise<string> {
  type Scene = {
    data: { id: string }[]
  }

  const url = getUrl('/scenes')

  url.searchParams.set('q', videoStar)
  // Convert "CamelCase" >> "Camel Case"
  url.searchParams.set('title', toCamelCase(videoTitle))
  url.searchParams.set('q', `${videoStar} ${siteOrWsite}`)
  // can site-param be used?
  url.searchParams.set('limit', '2')

  const result = (await axios.get<Scene>(url.href, config)).data
  return new Promise((resolve, reject) => {
    if (result.data.length > 1) {
      // CHECK THE FOLLOWING
      // if the same title
      // and if the same date
      // and the same models
      // and has bookmarks
      // choose the one with the most bookmarks
      // throw an error if number of bookmarks are the same
      // otherwise throw an error
      reject('too many slugs')
    } else if (result.data.length === 0) {
      reject('too few slugs')
    }

    //FIXME this sometimes returns an error " cannot read 'id' of 'undefined' "
    // 0 results returned?
    // other invalid data returned?
    // some other broken backend logic?
    // test with starID=97
    // might be one of the other methods?
    resolve(result.data[0].id)
  })
}

export const getStarSlug = async (star: string): Promise<string> => {
  const url = getUrl('/performers')
  url.searchParams.set('q', star)

  const result = (await axios.get<BasicModel>(url.href, config)).data

  let data = result.data.filter(s => s.extras.gender === 'Female')
  if (data.length > 1) data = data.filter(s => s.posters.length > 0)
  if (data.length > 1) data = data.filter(s => s.name === star)

  return data[0].id
}

export const getSceneData = async (slug: string) => {
  type Scene = {
    data: {
      id: string
      title: string
      date: string
      image: string
      background: {
        full: string
        large: string
        medium: string
        small: string
      }
      performers: Performer[]
    }
  }

  try {
    const url = getUrl(`/scenes/${slug}`)
    const result = (await axios.get<Scene>(url.href, config)).data

    return {
      id: result.data.id,
      title: result.data.title,
      date: result.data.date,
      image: result.data.background.full, // large is larger, but currently generates white background
      performers: result.data.performers
        .filter(({ extra: { gender } }) => gender === 'Female')
        .map(performer => ({
          id: performer.id,
          name: performer.name,
          extra: {
            birthday: performer.extra.birthday,
            ethnicity: performer.extra.ethnicity,
            nationality: performer.extra.nationality,
            haircolor: performer.extra.haircolor?.split(';')[0],
            height: performer.extra.height ? inToCm(parseInt(performer.extra.height)).toString() : null,
            weight: performer.extra.weight ? lbsToKg(parseInt(performer.extra.weight)).toString() : null,
            cupsize: performer.extra.cupsize ? getCupSize(performer.extra.cupsize) : null
          }
        }))
    }
  } catch (error) {
    throw new Error(SERVER_ERROR)
  }
}

export const getStarData = async (slug: string) => {
  type Data = {
    data: {
      id: string
      slug: string
      name: string
      extras: Extra & {
        birthplace: string | null
        birthplace_code: string | null
        hair_colour: string | null
      }
      aliases: string[]
      image: string
      thumbnail: string
      posters: {
        id: number
        url: string
      }[]
      site_performers: {
        id: string
        name: string
        site: {
          id: number
          name: string
          short_name: string
          url: string
          logo: string
          poster: string
        }
      }[]
    }
  }

  try {
    const url = getUrl(`/performers/${slug}`)
    const result = (await axios.get<Data>(url.href, config)).data

    return {
      cupsize: result.data.extras.cupsize ? getCupSize(result.data.extras.cupsize) : null,
      haircolor: result.data.extras.hair_colour?.split(';')[0],
      ethnicity: result.data.extras.ethnicity,
      birthdate: result.data.extras.birthday,
      height: result.data.extras.height ? parseInt(result.data.extras.height.match(/^\d+/)?.[0] ?? '0') : null,
      weight: result.data.extras.weight ? parseInt(result.data.extras.weight.match(/^\d+/)?.[0] ?? '0') : null,
      posters: result.data.posters.map(poster => poster.url),
      videos: result.data.site_performers.map(v => ({ id: v.id, name: v.name })),
      sites: getUnique(
        result.data.site_performers.map(v => ({
          id: v.id,
          name: v.site.name,
          label: v.site.short_name,
          logo: v.site.logo,
          poster: v.site.logo
        })),
        'id'
      )
    }
  } catch (error) {
    throw new Error(SERVER_ERROR)
  }
}
