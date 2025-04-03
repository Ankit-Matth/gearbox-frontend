import {
  ComparisonOperator,
  CriteriaValue,
  InputType,
  CriterionStagingWithValueList,
  Unit,
  ApiStatus,
} from '../model'
import React, { useEffect, useRef, useState } from 'react'
import Field from './Inputs/Field'
import Button from './Inputs/Button'
import { publishElCriteriaHasCriterion } from '../api/elCriteriaHasCriterion'
import { createValue } from '../api/value'
import { updateCriterionStaging } from '../api/criterionStaging'
import { RequestStatusBar } from './RequestStatusBar'

export function CriteriaValueAssignment({
  stagingCriterion,
  inputTypes,
  numericValues,
  setNumericValues,
  units,
}: {
  stagingCriterion: CriterionStagingWithValueList
  numericValues: CriteriaValue[]
  inputTypes: InputType[]
  setNumericValues: React.Dispatch<React.SetStateAction<CriteriaValue[]>>
  units: Unit[]
}) {
  // const [valueId, setValueId] = useState<number>(0)
  const [echcValueIds, setEchcValueIds] = useState<number[]>(
    stagingCriterion.echc_value_ids &&
      stagingCriterion.echc_value_ids.length > 0
      ? stagingCriterion.echc_value_ids
      : []
  )
  const [operator, setOperator] = useState<ComparisonOperator | ''>('')
  const [valueString, setValueString] = useState<string>('')
  const [unit, setUnit] = useState<Unit | null>(null)
  const [addValueStatus, setAddValueStatus] = useState<ApiStatus>('not started')
  const [saveValueStatus, setSaveValueStatus] =
    useState<ApiStatus>('not started')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const timerIdRef = useRef<NodeJS.Timer | null>(null)
  const [valuesChanged, setValuesChanged] = useState<boolean>(false)
  const [valuesSaved, setValuesSaved] = useState<boolean>(false)
  const [valuesPublished, setValuesPublished] = useState<boolean>(
    stagingCriterion.echc_adjudication_status === 'ACTIVE'
  )
  const isSendingAddReq = addValueStatus === 'sending'
  const isSendingSaveReq = saveValueStatus === 'sending'

  const operatorMap: Map<ComparisonOperator, string> = new Map([
    ['eq', '=='],
    ['gt', '>'],
    ['gte', '>='],
    ['lt', '<'],
    ['lte', '<='],
  ])
  // Remove formRef since we're using controlled components
  const isAddButtonDisabled = !operator || !valueString || !unit

  const inputType = inputTypes.find(
    (i) => i.id === stagingCriterion.input_type_id
  )
  const inputTypeDisplay = `${inputType?.data_type || ''}:${
    inputType?.render_type || ''
  }`
  const isList =
    inputTypes.find(
      (inputType) => inputType.id === stagingCriterion.input_type_id
    )?.data_type === 'list'

  const options: string =
    stagingCriterion.criterion_value_list
      ?.map((v) => v.value_string)
      .join(', ') || ''

  useEffect(() => {
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
    }
  }, [])
  const publishValue = () => {
    if (
      confirm(
        'Publishing the values will finalize the changes and can not be reverted. Are you sure to publish?'
      )
    ) {
      publishElCriteriaHasCriterion({
        value_ids: echcValueIds,
        criterion_id: stagingCriterion.criterion_id,
        eligibility_criteria_id: stagingCriterion.eligibility_criteria_id,
        active: true,
        criterion_staging_id: stagingCriterion.id,
      })
        .then(() => setValuesPublished(true))
        .catch((error) => {
          console.error(error.message)
          setSaveValueStatus('error')
          setErrorMsg(error.message)
        })
    }
  }

  const saveEchcValues = () => {
    const { criterion_value_list, ...updatedCriterionStaging } =
      stagingCriterion
    setSaveValueStatus('sending')
    updateCriterionStaging({
      ...updatedCriterionStaging,
      criterion_value_ids: criterion_value_list?.map((v) => v.id) || [],
      echc_value_ids: echcValueIds.filter(Boolean),
    })
      .then(() => {
        setSaveValueStatus('success')
        setValuesSaved(true)
      })
      .catch((error) => {
        console.error(error.message)
        setSaveValueStatus('error')
        setErrorMsg(error.message)
      })
      .finally(() => {
        setValuesChanged(false)
        timerIdRef.current = setTimeout(
          () => setSaveValueStatus('not started'),
          3000
        )
      })
  }
  const addNumericValue = (event: React.FormEvent) => {
    event.preventDefault()
    if (unit && operator && valueString) {
      setAddValueStatus('sending')
      createValue({
        id: 0,
        description: `${operator} ${valueString} ${unit.name}`,
        operator,
        value_string: valueString,
        unit_id: unit.id,
        unit_name: unit.name,
        is_numeric: true,
        active: true,
      })
        .then((res) => {
          setNumericValues([...numericValues, res])
          setAddValueStatus('success')
        })
        .catch((error) => {
          console.error('Error creating value:', error.message)
          setAddValueStatus('error')
          setErrorMsg(error.message)
        })
        .finally(() => {
          setOperator('')
          setValueString('')
          setUnit(null)
          timerIdRef.current = setTimeout(
            () => setAddValueStatus('not started'),
            3000
          )
        })
    }
  }

  const valueOptions: { label: string; value: number }[] = isList
    ? stagingCriterion.criterion_value_list?.map((v) => ({
        value: v.id,
        label: `== ${v.value_string}` || '',
      })) || []
    : numericValues.map((v) => {
        const unit = units.find((u) => u.id === v.unit_id)
        const unitName = unit?.name === 'none' ? '' : unit?.name

        return {
          value: v.id,
          label: `${v.operator ? operatorMap.get(v.operator) : ''} ${
            v.value_string || ''
          } ${unitName || ''}`,
        }
      })

  return (
    <>
      <div className="my-4 p-4 border border-gray-400">
        {valuesPublished && (
          <div className="flex justify-end">
            <h1 className="text-green-600">Values Published</h1>
          </div>
        )}
        <div className="mb-2">
          <span className="font-bold">Text: </span>
          {stagingCriterion.text || ''}
        </div>
        <div className="mb-2">
          <span className="font-bold">Code: </span>
          {stagingCriterion.code || ''}
        </div>
        <div className="mb-2">
          <span className="font-bold">Display Name: </span>
          {stagingCriterion.display_name || ''}
        </div>
        <div className="mb-2">
          <span className="font-bold">Description:</span>
          {stagingCriterion.description || ''}
        </div>
        <div className="mb-2">
          <span className="font-bold">Input Type: </span>
          {inputTypeDisplay}
        </div>
        {isList ? (
          <>
            <div className="mb-2">
              <span className="font-bold">Options: </span>
              {options}
            </div>
            <Field
              config={{
                type: 'multiselect',
                name: 'values',
                label: 'Values: ',
                disabled: valuesPublished,
                options: valueOptions,
                isCreatable: false,
              }}
              value={valueOptions.filter((option) =>
                echcValueIds.includes(option.value)
              )}
              onChange={(newValues: { label: string; value: number }[]) => {
                setEchcValueIds(newValues.map((v) => v.value))
                setValuesChanged(true)
              }}
            />
          </>
        ) : (
          <>
            <Field
              config={{
                type: 'multiselect',
                name: 'values',
                label: 'Values: ',
                disabled: valuesPublished,
                options: valueOptions,
                isCreatable: false,
              }}
              value={valueOptions.filter((option) =>
                echcValueIds.includes(option.value)
              )}
              onChange={(newValues: { label: string; value: number }[]) => {
                setEchcValueIds(newValues.map((v) => v.value))
                setValuesChanged(true)
              }}
            />
            {!valuesPublished && (
              <div className="mt-4 border border-gray-400 rounded p-4">
                <span className="font-bold">
                  If value is not found above, you can add a new value:{' '}
                </span>
                <form onSubmit={addNumericValue}>
                  <div className="flex items-center gap-4 mt-2">
                    <Field
                      config={{
                        type: 'select',
                        name: 'operator',
                        placeholder: 'Select an Operator',
                        label: 'Operator: ',
                        options: Array.from(operatorMap, ([value, label]) => ({
                          value,
                          label,
                        })),
                      }}
                      value={operator}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                        setOperator(e.target.value as ComparisonOperator)
                      }
                    />
                    <Field
                      config={{
                        type: 'number',
                        name: 'valueString',
                        placeholder: 'Enter a numeric value',
                        label: 'Value String: ',
                        step: unit?.name === 'years' ? 1 : 0.1,
                      }}
                      value={valueString}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setValueString(e.target.value)
                      }
                    />
                    <Field
                      config={{
                        type: 'select',
                        name: 'unit',
                        placeholder: 'Select a Unit',
                        label: 'Unit: ',
                        options: units.map((u) => ({
                          value: u.id,
                          label: u.name,
                        })),
                      }}
                      value={unit?.id || 0}
                      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                        setUnit({
                          id: +e.target.value,
                          name: e.target.options[e.target.selectedIndex].text,
                        })
                      }}
                    />
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      otherClassName="mt-4"
                      type="submit"
                      size="small"
                      disabled={isAddButtonDisabled || isSendingAddReq}
                    >
                      Add
                    </Button>

                    {/* Request Status Bar */}
                    <div className="flex items-center">
                      <RequestStatusBar
                        apiStatus={addValueStatus}
                        errorMsg={errorMsg}
                      />
                    </div>
                  </div>
                </form>
              </div>
            )}
          </>
        )}
        {!valuesPublished && (
          <div className="flex items-center justify-between w-full">
            {/* Button Group */}
            <div className="flex space-x-4">
              <Button
                otherClassName="mt-4"
                size="small"
                onClick={saveEchcValues}
                disabled={!valuesChanged || isSendingSaveReq}
              >
                Save Value
              </Button>
              <Button
                otherClassName="mt-4"
                size="small"
                onClick={publishValue}
                disabled={
                  !valuesSaved || isSendingSaveReq || !echcValueIds.length
                }
              >
                Publish Value
              </Button>
            </div>

            {/* Request Status Bar */}
            <div className="flex items-center h-full mt-4 ml-4">
              <RequestStatusBar apiStatus={saveValueStatus} errorMsg="error" />
            </div>
          </div>
        )}
      </div>
    </>
  )
}
