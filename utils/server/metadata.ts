import axios from 'axios'

import { getUnique } from '../shared'

import { settingsConfig } from '@config'

type IGender = 'Female' | 'Male' | null

interface IExtra {
  birthday: string | null
  ethnicity: string | null
  nationality: string | null
  weight: string | null
  height: string | null
  cupsize: string | null
}

interface IBasicModel {
  data: {
    id: string
    slug: string
    name: string
    extras: IExtra & {
      gender: IGender
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

const config = { headers: { Authorization: `Bearer ${settingsConfig.THEPORNDB_API}` } }

const inToCm = (cm: number) => Math.round(cm * 2.54)
const lbsToKg = (lbs: number) => Math.round(lbs * 0.45359237)
const getCupSize = (input: string) => input.match(/[A-Z]+$/i)?.[0] ?? null

const getUrl = (path = '') => new URL(`https://api.metadataapi.net${path}`)

export const getSceneSlug = async (slug: string): Promise<string> => {
  interface IScene {
    data: { id: string }
  }

  const url = getUrl('/scenes/' + slug)

  const result = (await axios.get<IScene>(url.href, config)).data

  // TODO find out if this ever throws?
  return Promise.resolve(result.data.id)
}

export async function findSceneSlug(videoStar: string, videoTitle: string, subsite?: string): Promise<string> {
  interface IScene {
    data: { id: string }[]
  }

  const url = getUrl('/scenes')

  url.searchParams.set('q', videoStar)
  url.searchParams.set('title', videoTitle)
  if (subsite !== undefined) {
    url.searchParams.set('q', `${videoStar} ${subsite}`)
  }
  url.searchParams.set('limit', '2')

  const result = (await axios.get<IScene>(url.href, config)).data
  return new Promise((resolve, reject) => {
    if (result.data.length > 1) {
      reject('too many slugs was returned!')
    } else if (result.data.length === 0) {
      reject('to few slugs was returned!')
    }

    resolve(result.data[0].id)
  })
}

export const getStarSlug = async (star: string): Promise<string> => {
  const url = getUrl('/performers')
  url.searchParams.set('q', star)

  const result = (await axios.get<IBasicModel>(url.href, config)).data

  let data = result.data.filter(s => s.extras.gender === 'Female')
  if (data.length > 1) data = data.filter(s => s.posters.length > 0)
  if (data.length > 1) data = data.filter(s => s.name === star)

  return data[0].id
}

export const getSceneData = async (slug: string) => {
  interface IScene {
    data: {
      id: string
      title: string
      date: string
      image: string
      performers: {
        id: string
        name: string
        extra: IExtra & {
          gender: IGender
          haircolor: string | null
        }
        image: string
        thumbnail: string
      }[]
    }
  }

  const url = getUrl(`/scenes/${slug}`)
  const result = (await axios.get<IScene>(url.href, config)).data

  return {
    id: result.data.id,
    title: result.data.title,
    date: result.data.date,
    image: result.data.image,
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
}

export const getStarData = async (slug: string) => {
  interface IData {
    data: {
      id: string
      slug: string
      name: string
      extras: IExtra & {
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

  const url = getUrl(`/performers/${slug}`)
  const result = (await axios.get<IData>(url.href, config)).data

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
}
