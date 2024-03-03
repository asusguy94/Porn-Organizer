import axios, { AxiosRequestConfig } from 'axios'

import { toCamelCase } from './helper'

import { settingsConfig } from '@config'
import { Extra, Gender } from '@interfaces'
import { SceneData } from '@interfaces/api'

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
    posters?: {
      id: number
      url: string
    }[]
  }[]
}

//TODO Check if title.toLowerCase() matches videodata.title.toLowercase()

function createConfig(longTimeout = false): AxiosRequestConfig {
  const TIMEOUT_DEFAULT = 10
  const TIMEOUT_LONG = 30

  return {
    headers: { Authorization: `Bearer ${settingsConfig.THEPORNDB_API}` },
    timeout: (longTimeout ? TIMEOUT_LONG : TIMEOUT_DEFAULT) * 1000
  }
}

const SERVER_ERROR = 'Server might be down'

const inToCm = (cm: number) => Math.round(cm * 2.54)
const lbsToKg = (lbs: number) => Math.round(lbs * 0.45359237)
const getCupSize = (input: string) => input.match(/[A-Z]+$/i)?.at(0) ?? null

const getUrl = (path = '') => new URL(`https://api.metadataapi.net${path}`)

export async function getSceneSlug(slug: string): Promise<string> {
  type Scene = {
    data: { id: string }
  }

  const url = getUrl(`/scenes/${slug}`)

  const result = (await axios.get<Scene>(url.href, createConfig())).data

  // TODO find out if this ever throws?
  return Promise.resolve(result.data.id)
}

export default async function findBroadSceneSlug(videoTitle: string, wsiteOrSite?: string) {
  type Scene = {
    data: {
      id: string
      title: string
      background: {
        full: string
      }
      site: {
        name: string
      }
      date: string
    }[]
  }

  const url = getUrl('/scenes')
  url.searchParams.set('title', videoTitle)
  if (wsiteOrSite !== undefined) {
    url.searchParams.set('q', wsiteOrSite)
  }

  const result = (await axios.get<Scene>(url.href, createConfig(true))).data

  return result.data.map(s => ({
    id: s.id,
    title: s.title,
    image: s.background.full,
    site: s.site.name,
    date: s.date
  }))
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

  const result = (await axios.get<Scene>(url.href, createConfig())).data
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

export async function getStarSlug(star: string): Promise<string> {
  const url = getUrl('/performers')
  url.searchParams.set('q', star)

  const result = (await axios.get<BasicModel>(url.href, createConfig())).data

  let prevData = result.data
  let data = prevData.filter(s => s.extras.gender === 'Female')
  if (data.length === 0) data = prevData

  prevData = data
  if (data.length > 1) data = data.filter(s => s.posters !== undefined && s.posters.length > 0)
  if (data.length === 0) data = prevData

  prevData = data
  if (data.length > 1) data = data.filter(s => s.name === star)
  if (data.length === 0) data = prevData

  return data[0].id
}

export async function getSceneData(slug: string, longTimeout = false) {
  try {
    const url = getUrl(`/scenes/${slug}`)
    const result = (await axios.get<{ data: SceneData }>(url.href, createConfig(longTimeout))).data

    return {
      id: result.data.id,
      title: result.data.title,
      date: result.data.date,
      image: result.data.background.full,
      performers: result.data.performers
        .filter(({ extra: { gender } }) => gender === 'Female')
        .map(performer => ({
          id: performer.id,
          name: performer.name,
          extra: {
            birthday: performer.extra.birthday,
            ethnicity: performer.extra.ethnicity,
            nationality: performer.extra.nationality,
            haircolor: performer.extra.haircolor?.split(';').at(0),
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

export async function getStarData(slug: string) {
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
    }
  }

  try {
    const url = getUrl(`/performers/${slug}`)
    const result = (await axios.get<Data>(url.href, createConfig())).data

    return {
      cupsize: result.data.extras.cupsize ? getCupSize(result.data.extras.cupsize) : null,
      haircolor: result.data.extras.hair_colour?.split(';').at(0),
      ethnicity: result.data.extras.ethnicity,
      birthdate: result.data.extras.birthday,
      height: result.data.extras.height ? parseInt(result.data.extras.height.match(/^\d+/)?.at(0) ?? '0') : null,
      weight: result.data.extras.weight ? parseInt(result.data.extras.weight.match(/^\d+/)?.at(0) ?? '0') : null,
      posters: result.data.posters.map(poster => poster.url)
    }
  } catch (error) {
    throw new Error(SERVER_ERROR)
  }
}

export async function getStarScenes(slug: string) {
  type Data = {
    data: {
      id: string
      title: string
      type: string
      slug: string
      date: string
      site: {
        name: string
        short_name: string
        network?: {
          name: string
          short_name: string
        }
      }
    }[]
    links: {
      first: string
      last: string
      prev: null
      next: string
    }
    meta: {
      current_page: number
      from: number
      last_page: number
      per_page: number
      to: number
      total: number
    }
  }

  const getData = async (url: URL, page = 1) => {
    url.searchParams.set('page', page.toString())
    const result = (await axios.get<Data>(url.href, createConfig())).data

    const data = result.data.map(item => ({
      id: item.id,
      date: item.date,
      site: { name: item.site.name, network: item.site.network }
    }))

    return { data, meta: result.meta }
  }

  const formatData = (arr: Awaited<ReturnType<typeof getData>>['data']) => {
    const data: { name: string; videos: { id: string; date: string }[] }[] = []

    arr.forEach(item => {
      const { id, date, site } = item

      const existingIndex = data.findIndex(item => item.name === site.name)

      if (existingIndex >= 0) {
        data[existingIndex].videos.push({ id, date })
      } else {
        data.push({ name: site.name, videos: [{ id, date }] })
      }
    })

    return data
  }

  try {
    const url = getUrl(`/performers/${slug}/scenes`)

    const initialResult = await getData(url)
    const data = [...initialResult.data]
    for (let page = initialResult.meta.current_page + 1; page <= initialResult.meta.last_page; page++) {
      const next = await getData(url, page)

      data.push(...next.data)
    }

    return {
      original_data: data,
      formatted: formatData(data)
    }
  } catch (error) {
    throw new Error(SERVER_ERROR)
  }
}
