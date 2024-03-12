import axios, { AxiosRequestConfig } from 'axios'

import { settingsConfig } from '@/config'

function createConfig(longTimeout = false): AxiosRequestConfig {
  const TIMEOUT_DEFAULT = 10
  const TIMEOUT_LONG = 30

  return {
    headers: { Authorization: `Bearer ${settingsConfig.THEPORNDB_API}` },
    timeout: (longTimeout ? TIMEOUT_LONG : TIMEOUT_DEFAULT) * 1000
  }
}

const getUrl = (path = '') => new URL(`https://api.theporndb.net${path}`)

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
