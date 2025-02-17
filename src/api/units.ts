import { Unit } from '../model'
import { fetchGearbox } from './utils'

export function getUnits(): Promise<Unit[]> {
  return fetchGearbox('/gearbox/units')
    .then((res) => res.json() as Promise<{ results: Unit[] }>)
    .then((res) => res.results)
}
