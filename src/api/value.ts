import { CriteriaValue } from '../model'
import { fetchGearbox } from './utils'

export function getValues(): Promise<CriteriaValue[]> {
  return fetchGearbox('/gearbox/values')
    .then((res) => res.json() as Promise<{ results: CriteriaValue[] }>)
    .then((res) => res.results)
}

export function createValue(value: CriteriaValue): Promise<CriteriaValue> {
  return fetchGearbox('/gearbox/value', {
    method: 'POST',
    body: JSON.stringify(value),
  }).then((res) => {
    if (!res.ok) {
      return res.json().then((errorData) => {
        let errorMessage = `Request failed with status: ${res.status}`

        if (res.status === 409) {
          errorMessage = 'The value already exists'
        } else if (errorData.message) {
          errorMessage = errorData.message
        }

        throw new Error(errorMessage)
      })
    }

    return res.json() as Promise<CriteriaValue>
  })
}
