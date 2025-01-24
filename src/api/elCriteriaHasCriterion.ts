import { StagingElCriteriaHasCriterion } from '../model'
import { fetchGearbox } from './utils'

export function publishElCriteriaHasCriterion(
  body: StagingElCriteriaHasCriterion
) {
  return fetchGearbox('/gearbox/publish-el-criteria-has-criterion', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((res) => res.json() as Promise<string>)
}
