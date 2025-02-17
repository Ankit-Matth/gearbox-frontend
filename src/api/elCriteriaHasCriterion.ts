import { ElCriteriaHasCriterion, StagingElCriteriaHasCriterion } from '../model'
import { fetchGearbox } from './utils'

export function publishElCriteriaHasCriterion(
  body: StagingElCriteriaHasCriterion
): Promise<string> {
  return fetchGearbox('/gearbox/publish-el-criteria-has-criterion', {
    method: 'POST',
    body: JSON.stringify(body),
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((errorData) => {
        const errorMessage =
          errorData.message || `Publishing failed: ${res.status}`
        throw new Error(errorMessage)
      })
    }
    return res.json() as Promise<string>
  })
}

export function getElCriteriaHasCriterionsByElId(
  eligibilityCriteriaId: number
): Promise<ElCriteriaHasCriterion[]> {
  return fetchGearbox(
    `/gearbox/el-criteria-has-criterions/${eligibilityCriteriaId}`
  )
    .then((res) => res.json() as Promise<{ results: ElCriteriaHasCriterion[] }>)
    .then((res) => res.results)
}
