import Field from '../components/Inputs/Field'
import React, { useEffect, useState } from 'react'
import {
  ApiStatus,
  CriteriaValue,
  InputType,
  StagingCriterionWithValueList,
  StudyVersionAdjudication,
  Unit,
} from '../model'
import {
  getCriterionStaging,
  getStudyVersionsAdjudication,
  getValues,
} from '../api/studyAdjudication'
import { ErrorRetry } from '../components/ErrorRetry'
import { CriteriaValueBuilder } from '../components/CriteriaValueBuilder'
import { getInputTypes } from '../api/inputTypes'
import { getUnits } from '../api/units'

export function CriteriaValueBuilderPage() {
  const [studyVersionsAdjudication, setStudyVersionsAdjudication] = useState<
    StudyVersionAdjudication[]
  >([])
  const [svaIndex, setSvaIndex] = useState<number>(-1)
  const [stagingCriteria, setStagingCriteria] = useState<
    StagingCriterionWithValueList[]
  >([])
  const [inputTypes, setInputTypes] = useState<InputType[]>([])
  const [numericValues, setNumericValues] = useState<CriteriaValue[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [loadingStatus, setLoadingStatus] = useState<ApiStatus>('not started')

  const loadPage = () => {
    Promise.all([
      getStudyVersionsAdjudication(),
      getValues(),
      getInputTypes(),
      getUnits(),
    ])
      .then(([studyVersions, values, inputTypes, units]) => {
        setStudyVersionsAdjudication(studyVersions)
        setNumericValues(values.filter((v) => v.is_numeric))
        setInputTypes(inputTypes)
        setUnits(units)
        setLoadingStatus('success')
      })
      .catch((err) => {
        setLoadingStatus('error')
        console.error(err)
      })
  }

  const onStudyChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = +event.target.value
    setSvaIndex(index)
    getCriterionStaging(
      studyVersionsAdjudication[index].eligibility_criteria_id
    )
      .then((stagingCriteria) => {
        const activeStagingCriteria = stagingCriteria.filter(
          (sc) => sc.criterion_adjudication_status === 'ACTIVE'
        )
        setStagingCriteria(activeStagingCriteria)
      })
      .catch(() => setStagingCriteria([]))
  }

  useEffect(() => {
    setLoadingStatus('sending')
    loadPage()
  }, [])

  if (loadingStatus === 'not started' || loadingStatus === 'sending') {
    return <div>Loading...</div>
  } else if (loadingStatus === 'error') {
    return <ErrorRetry retry={loadPage} />
  }

  return (
    <div>
      <Field
        config={{
          type: 'select',
          label: 'Select a Study',
          placeholder: 'Select One',
          name: 'studyVersion',
          options: studyVersionsAdjudication.map((sva, index) => ({
            value: index,
            label: `${sva.study.code} - ${sva.study.name}`,
          })),
        }}
        value={svaIndex}
        onChange={onStudyChanged}
      />
      {stagingCriteria.length ? (
        stagingCriteria
          .sort((a, b) => a.id - b.id)
          .map((sc) => (
            <CriteriaValueBuilder
              key={sc.id}
              stagingCriterion={sc}
              inputTypes={inputTypes}
              numericValues={numericValues}
              units={units}
            />
          ))
      ) : (
        <div className="mt-4">No Active Staging Criteria Found</div>
      )}
    </div>
  )
}
