import {
  CriteriaValue,
  InputType,
  StagingCriterionWithValueList,
  Unit,
} from '../model'
import React, { useState } from 'react'
import Field from './Inputs/Field'
import Button from './Inputs/Button'
import { publishElCriteriaHasCriterion } from '../api/elCriteriaHasCriterion'

export function CriteriaValueBuilder({
  stagingCriterion,
  inputTypes,
  numericValues,
  units,
}: {
  stagingCriterion: StagingCriterionWithValueList
  numericValues: CriteriaValue[]
  inputTypes: InputType[]
  units: Unit[]
}) {
  const [valueId, setValueId] = useState<number>(0)
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
    stagingCriterion.value_list?.map((v) => v.value_string).join(', ') || ''

  const assignValue = () => {
    publishElCriteriaHasCriterion({
      value_id: valueId,
      criterion_id: stagingCriterion.criterion_id,
      eligibility_criteria_id: stagingCriterion.eligibility_criteria_id,
      active: true,
      criterion_staging_id: stagingCriterion.id,
    }).then()
  }

  return (
    <div className="my-4 p-4 border border-gray-400">
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
              type: 'select',
              name: 'value',
              placeholder: 'Select One',
              label: 'Value: ',
              options:
                stagingCriterion.value_list?.map((v) => ({
                  value: v.id,
                  label: `== ${v.value_string}` || '',
                })) || [],
            }}
            value={valueId}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setValueId(+event.target.value)
            }
          />
        </>
      ) : (
        <>
          <Field
            config={{
              type: 'select',
              name: 'value',
              placeholder: 'Select One',
              label: 'Value: ',
              options: numericValues.map((v) => ({
                value: v.id,
                label: v.description || '',
              })),
            }}
            value={valueId}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
              setValueId(+event.target.value)
            }
          />
          <div className="mt-4 border border-gray-400 rounded p-4">
            <span className="font-bold">
              If value is not found above, you can add a new value:{' '}
            </span>
            <div className="flex items-center gap-4 mt-2">
              <Field
                config={{
                  type: 'select',
                  name: 'operator',
                  placeholder: 'Select an Operator',
                  label: 'Operator: ',
                  options: [
                    {
                      value: 'eq',
                      label: '==',
                    },
                    {
                      value: 'lt',
                      label: '<',
                    },
                    {
                      value: 'lte',
                      label: '<=',
                    },
                    {
                      value: 'gt',
                      label: '>',
                    },
                    {
                      value: 'gt3',
                      label: '>=',
                    },
                  ],
                }}
              />
              <Field
                config={{
                  type: 'number',
                  name: 'valueString',
                  placeholder: 'Enter a numeric value',
                  label: 'Value String: ',
                }}
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
              />
            </div>
            <Button otherClassName="mt-4" size="small">
              Add
            </Button>
          </div>
        </>
      )}
      <Button otherClassName="mt-4" size="small" onClick={assignValue}>
        Assign Value
      </Button>
    </div>
  )
}
