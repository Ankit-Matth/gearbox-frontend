import type { Study } from '../model'
import { fetchGearbox, readCache, writeCache } from './utils'

const SESSION_STORAGE_KEY = 'gearbox:studies'

export function getStudies() {
  const cache = readCache<Study[]>(SESSION_STORAGE_KEY)
  if (cache !== null) return Promise.resolve(cache)

  return fetchGearbox('/gearbox/studies')
    .then((res) => res.json())
    .then(fetch)
    .then((res) => res.json() as Promise<{ version: string; studies: Study[] }>)
    .then((res) => res.studies)
    .then((studies) =>
      studies.map(
        (study) =>
          ({
            ...study,
            sites: study.sites.filter((site) => site.active),
          } as Study)
      )
    )
    .then((data) => {
      writeCache(SESSION_STORAGE_KEY, JSON.stringify(data))
      return data
    })
}

export function buildStudies() {
  return fetchGearbox('/gearbox/build-studies', {
    method: 'POST',
  }).then((res) => {
    if (!res.ok) {
      throw new Error('build studies failed')
    }
  })
}
