import React, { useEffect, useState } from 'react'
import { getStudyVersionsAdjudication } from '../api/studyAdjudication'
import {
  ApiStatus,
  CriteriaValue,
  InputType,
  CriterionStagingWithValueList,
  StudyVersionAdjudication,
} from '../model'
import Field from '../components/Inputs/Field'
import { CriteriaAnnotationVerification } from '../components/CriteriaAnnotationVerification'
import { getInputTypes } from '../api/inputTypes'
import { ErrorRetry } from '../components/ErrorRetry'
import { getValues } from '../api/value'
import { getCriterionStaging } from '../api/criterionStaging'
import LoadingState from '../components/LoadingState'

export function CriteriaAnnotationVerificationPage() {
  const [studyVersionsAdjudication, setStudyVersionsAdjudication] = useState<
    StudyVersionAdjudication[]
  >([])
  const [svaIndex, setSvaIndex] = useState<number>(-1)
  const [stagingCriteria, setStagingCriteria] = useState<
    CriterionStagingWithValueList[]
  >([])
  const [values, setValues] = useState<CriteriaValue[]>([])
  const [inputTypes, setInputTypes] = useState<InputType[]>([])
  const [loadingStatus, setLoadingStatus] = useState<ApiStatus>('not started')

  const loadPage = () => {
    Promise.all([getStudyVersionsAdjudication(), getValues(), getInputTypes()])
      .then(([studyVersions, values, inputTypes]) => {
        setStudyVersionsAdjudication(studyVersions)
        setValues(values.filter((v) => !v.is_numeric && v.unit_id === 1))
        setInputTypes(inputTypes)
        setLoadingStatus('success')
      })
      .catch((err) => {
        console.error(err)
        setLoadingStatus('error')
      })
  }
  useEffect(() => {
    setLoadingStatus('sending')
    loadPage()
  }, [])

  const onStudyChanged = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = +event.target.value
    setSvaIndex(index)
    getCriterionStaging(
      studyVersionsAdjudication[index].eligibility_criteria_id
    )
      .then(setStagingCriteria)
      .catch(() => setStagingCriteria([]))
  }

  if (loadingStatus === 'not started' || loadingStatus === 'sending') {
    return <LoadingState />
  } else if (loadingStatus === 'error') {
    return <ErrorRetry retry={loadPage} />
  }

  return (
    <div>
      <Field
        config={{
          type: 'select',
          label: 'Select a Study to Adjudicate',
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
            <CriteriaAnnotationVerification
              key={sc.id}
              stagingCriterion={sc}
              lookupValues={values}
              inputTypes={inputTypes}
              setLookupValues={setValues}
            />
          ))
      ) : (
        <div className="mt-4">No Staging Criteria Found</div>
      )}
    </div>
  )
}
