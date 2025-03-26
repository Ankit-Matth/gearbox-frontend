import {
  ApiStatus,
  Criterion,
  InputType,
  MatchFormFieldConfig,
  MatchFormGroupConfig,
} from '../model'
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from 'react-beautiful-dnd'
import React, { useEffect, useRef, useState } from 'react'
import { buildMatchForm, updateMatchFormConfig } from '../api/matchFormConfig'
import DropdownSection from '../components/DropdownSection'
import FieldWrapper from '../components/FieldWrapper'
import Field from '../components/Inputs/Field'
import Button from '../components/Inputs/Button'
import { ErrorRetry } from '../components/ErrorRetry'
import { AlertCircle, Check, Loader } from 'react-feather'
import { getShowIfFields } from '../utils'
import { ShowIfBuilder } from '../components/ShowIfBuilder'
import { Fields } from '@react-awesome-query-builder/ui'
import { PublishMatchForm } from '../components/PublishMatchForm'
import { getCriteriaNotExistInMatchForm } from '../api/criterion'
import { getInputTypes } from '../api/inputTypes'

function reorder<T extends MatchFormGroupConfig | MatchFormFieldConfig>(
  list: T[],
  startIndex: number,
  endIndex: number
): T[] {
  const result = Array.from(list)
  const [removed] = result.splice(startIndex, 1)
  result.splice(endIndex, 0, removed)
  return result
}

export function InputFormBuilderPage() {
  const [fields, setFields] = useState<MatchFormFieldConfig[]>([])
  const [showIfFields, setShowIfFields] = useState<Fields>({})
  const [originalFields, setOriginalFields] = useState<MatchFormFieldConfig[]>(
    []
  )
  const [groups, setGroups] = useState<MatchFormGroupConfig[]>([])
  const [confirmDisabled, setConfirmDisabled] = useState(true)
  const [loadingStatus, setLoadingStatus] = useState<ApiStatus>('not started')
  const [confirmStatus, setConfirmStatus] = useState<ApiStatus>('not started')
  const timerIdRef = useRef<NodeJS.Timer | null>(null)
  const [criteriaNotInMatchForm, setCriteriaNotInMatchForm] = useState<
    Criterion[]
  >([])
  const [selectedCriterionByGroup, setSelectedCriterionByGroup] = useState<
    Record<number, number>
  >({})
  const [inputTypes, setInputTypes] = useState<InputType[]>([])

  const loadMatchForm = () => {
    setLoadingStatus('sending')
    buildMatchForm(false)
      .then((res) => {
        setFields(res.fields)
        setShowIfFields(getShowIfFields(res.fields))
        setOriginalFields(res.fields)
        setGroups(res.groups)
        setLoadingStatus('success')
      })
      .catch((err) => {
        console.error(err)
        setLoadingStatus('error')
      })
  }

  useEffect(() => {
    loadMatchForm()
    getCriteriaNotExistInMatchForm().then(setCriteriaNotInMatchForm)
    getInputTypes().then(setInputTypes)
    return () => {
      if (timerIdRef.current) {
        clearTimeout(timerIdRef.current)
      }
    }
  }, [])

  const onDragEnd = (result: DropResult) => {
    const { destination, source } = result
    if (destination && destination.droppableId === source.droppableId) {
      const fieldsWithinGroup = fields.filter(
        (f) => f.groupId === +destination.droppableId
      )
      const fromField = fieldsWithinGroup[source.index]
      const toField = fieldsWithinGroup[destination.index]
      const fromIndex = fields.findIndex((f) => f.id === fromField.id)
      const toIndex = fields.findIndex((f) => f.id === toField.id)
      const newFields = reorder(fields, fromIndex, toIndex)
      setFields(newFields)
      setConfirmDisabled(false)
    }
  }

  const confirm = () => {
    setConfirmStatus('sending')
    setConfirmDisabled(true)
    updateMatchFormConfig({
      groups,
      fields,
    })
      .then(() => setConfirmStatus('success'))
      .catch((err) => {
        setConfirmStatus('error')
        setFields(originalFields)
        console.error(err)
      })
      .finally(
        () =>
          (timerIdRef.current = setTimeout(
            () => setConfirmStatus('not started'),
            3000
          ))
      )
  }

  const addCriterion = (groupId: number) => () => {
    const selectedCriterionId = selectedCriterionByGroup[groupId]
    if (!selectedCriterionId) {
      return
    }

    const criterionToAdd = criteriaNotInMatchForm.find(
      (c) => c.id === selectedCriterionId
    )
    if (!criterionToAdd) {
      return
    }
    const inputType = inputTypes.find(
      (t) => t.id === criterionToAdd.input_type_id
    )?.render_type

    if (!inputType) {
      return
    }

    const newField: MatchFormFieldConfig = {
      id: criterionToAdd.id,
      groupId,
      type: inputType,
      name: criterionToAdd.code,
      label: criterionToAdd.description,
      options: criterionToAdd.values.map((v) => ({
        value: v.id,
        label: v.value_string || '',
        description: '',
      })),
    }

    const newFields = [newField, ...fields]
    setFields(newFields)
    setConfirmDisabled(false)

    setCriteriaNotInMatchForm((prev) =>
      prev.filter((c) => c.id !== selectedCriterionId)
    )

    setSelectedCriterionByGroup((prev) => ({
      ...prev,
      [groupId]: 0,
    }))
  }

  const handleCriterionChange = (groupId: number, criterionId: number) => {
    setSelectedCriterionByGroup((prev) => ({
      ...prev,
      [groupId]: criterionId,
    }))
  }

  if (loadingStatus === 'not started' || loadingStatus === 'sending') {
    return <div>Loading...</div>
  } else if (loadingStatus === 'error') {
    return <ErrorRetry retry={loadMatchForm} />
  }

  return (
    <div className="h-screen pb-8">
      <section className="h-full overflow-scroll">
        <div className="top-0 sticky bg-white px-8 py-2">
          <h1 className="uppercase text-primary font-bold z-10">
            <span>Question List</span>
          </h1>
        </div>
        <div className="px-8 pb-4">
          <div className="flex items-center justify-between">
            <PublishMatchForm />
            <div className="flex items-center">
              {confirmStatus === 'sending' ? (
                <Loader className="mr-2" />
              ) : confirmStatus === 'success' ? (
                <h2 className="text-base text-green-600 mr-4 flex">
                  <Check />
                  Updated Successfully
                </h2>
              ) : (
                confirmStatus === 'error' && (
                  <h2 className="text-base text-red-600 mr-4 flex">
                    <AlertCircle />
                    Updated Unsuccessfully
                  </h2>
                )
              )}
              <Button disabled={confirmDisabled} onClick={confirm}>
                Confirm
              </Button>
            </div>
          </div>
          <DragDropContext onDragEnd={onDragEnd}>
            {groups.map((group) => (
              <DropdownSection
                key={group.id}
                backgroundColor="bg-white"
                name={group.name || 'General'}
                isCollapsedAtStart
              >
                <Droppable droppableId={group.id.toString()}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="mt-2"
                    >
                      <div className="my-2">
                        <Field
                          config={{
                            type: 'select',
                            label: 'Select a Criterion Not In the Match Form',
                            placeholder: 'Select One',
                            options: criteriaNotInMatchForm.map((c) => ({
                              label: c.description,
                              value: c.id,
                            })),
                            name: `criteriaNotInMatchForm-${group.id}`,
                          }}
                          value={selectedCriterionByGroup[group.id] || 0}
                          onChange={(
                            event: React.ChangeEvent<HTMLSelectElement>
                          ) =>
                            handleCriterionChange(group.id, +event.target.value)
                          }
                        />
                        <div className="flex justify-end">
                          <Button
                            size="small"
                            otherClassName="mt-2"
                            onClick={addCriterion(group.id)}
                            disabled={!selectedCriterionByGroup[group.id]}
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                      {fields
                        .filter((field) => field.groupId === group.id)
                        .map((field, index) => (
                          <Draggable
                            key={field.id}
                            draggableId={field.id.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="mb-2 border border-gray-300 p-2"
                                style={provided.draggableProps.style}
                              >
                                <FieldWrapper key={field.id} isShowing>
                                  <Field
                                    config={{
                                      type: field.type,
                                      options: field.options,
                                      label: field.label,
                                      name: field.id.toString(),
                                      disabled: false,
                                    }}
                                  />
                                  <div className="mt-4">
                                    <h1>Show If: </h1>
                                    <ShowIfBuilder
                                      matchFormFields={fields}
                                      showIfFields={showIfFields}
                                      currentField={field}
                                      setFields={setFields}
                                      setConfirmDisabled={setConfirmDisabled}
                                    />
                                  </div>
                                </FieldWrapper>
                              </div>
                            )}
                          </Draggable>
                        ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DropdownSection>
            ))}
          </DragDropContext>
        </div>
      </section>
    </div>
  )
}
