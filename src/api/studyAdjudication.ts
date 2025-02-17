import { fetchGearbox } from './utils'
import { StudyVersionAdjudication } from '../model'

export function getStudyVersionsAdjudication(): Promise<
  StudyVersionAdjudication[]
> {
  return fetchGearbox('/gearbox/study-versions-adjudication').then(
    (res) => res.json() as Promise<StudyVersionAdjudication[]>
  )
}
