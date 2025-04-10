import React, { useState } from 'react'
import { MatchingPageProps } from '../pages/MatchingPage'
import { Check, Edit } from 'react-feather'
import ReactTooltip from 'react-tooltip'
import { Criterion, StudyVersion } from '../model'
import { useModal } from '../hooks/useModal'
import { CriteriaBuilderModal } from './CriteriaBuilderModal'
import Button from './Inputs/Button'
import { updateStudyVersion } from '../api/studyVersions'

export function BooleanLogicBuilder({
  gearboxState,
  studyVersion,
  studyVersions,
  setStudyVersions,
  criteriaNotInMatchForm,
}: {
  gearboxState: MatchingPageProps['state']
  studyVersion: StudyVersion
  studyVersions: StudyVersion[]
  setStudyVersions: (svs: StudyVersion[]) => void
  criteriaNotInMatchForm: Criterion[]
}) {
  const { study, status } = studyVersion
  const matchInfoId = `match-info-${study.id}`

  const [showModal, openModal, closeModal] = useModal()

  const [updated, setUpdated] = useState(false)

  const isActive = status === 'ACTIVE'
  const changeStudyStatus = () => {
    return updateStudyVersion({
      ...studyVersion,
      status: isActive ? 'IN_PROCESS' : 'ACTIVE',
    })
      .then(() =>
        setStudyVersions(
          studyVersions.filter((sv) => sv.id !== studyVersion.id)
        )
      )
      .catch(console.error)
  }

  return (
    <div>
      <div className="flex">
        {updated && (
          <h2 className="text-base text-green-600 mr-4 flex">
            <Check />
            Updated Successfully
          </h2>
        )}
        <Button onClick={changeStudyStatus}>
          {status === 'ACTIVE' ? 'Mark as In Progress' : 'Confirm'}
        </Button>
        <button
          className={`mr-2 ml-4 ${
            showModal ? 'text-red-700' : 'hover:text-red-700'
          }`}
          onClick={openModal}
          data-tip
          data-for={matchInfoId}
          aria-label="Open Edit Eligibility Criteria dialog"
        >
          <Edit />
        </button>
      </div>

      {showModal ? (
        <CriteriaBuilderModal
          matchForm={gearboxState.config}
          criteriaNotInMatchForm={criteriaNotInMatchForm}
          studyVersionId={studyVersion.id}
          closeModal={closeModal}
          setUpdated={setUpdated}
        />
      ) : (
        <ReactTooltip
          id={matchInfoId}
          border
          borderColor="black"
          effect="solid"
          type="light"
        >
          <span>Click to edit Eligibility Criteria</span>
        </ReactTooltip>
      )}
    </div>
  )
}
