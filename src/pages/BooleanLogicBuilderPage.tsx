import '@react-awesome-query-builder/ui/css/compact_styles.css'
import React, { useEffect, useState } from 'react'
import { MatchingPageProps } from './MatchingPage'
import TrialCard from '../components/TrialCard'
import { BooleanLogicBuilder } from '../components/BooleanLogicBuilder'
import { Tab, TabList, TabPanel, Tabs } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import { Criterion, StudyVersionStatus } from '../model'
import { useStudyVersions } from '../hooks/useStudyVersions'
import { ErrorRetry } from '../components/ErrorRetry'
import { PublishMatchForm } from '../components/PublishMatchForm'
import { getCriteriaNotExistInMatchForm } from '../api/criterion'

type TabType = {
  id: StudyVersionStatus
  display: string
}

const tabs: TabType[] = [
  {
    id: 'ACTIVE',
    display: 'Active',
  },
  {
    id: 'IN_PROCESS',
    display: 'In Process',
  },
]

export function BooleanLogicBuilderPage({
  gearboxState,
}: {
  gearboxState: MatchingPageProps['state']
}) {
  const [currentTab, setCurrentTab] = useState(0)
  const handleTabSelect = (index: number) => setCurrentTab(index)

  const [studyVersions, setStudyVersions, loadingStatus, fetchStudyVersion] =
    useStudyVersions(tabs[currentTab].id)

  const [criteriaNotInMatchForm, setCriteriaNotInMatchForm] = useState<
    Criterion[]
  >([])

  useEffect(() => {
    getCriteriaNotExistInMatchForm().then(setCriteriaNotInMatchForm)
  }, [])

  return (
    <Tabs tabIndex={currentTab} onSelect={handleTabSelect}>
      <TabList>
        {tabs.map((tab) => (
          <Tab key={tab.id}>{tab.display}</Tab>
        ))}
      </TabList>
      {tabs.map((tab) => (
        <TabPanel key={tab.id}>
          {loadingStatus === 'not started' || loadingStatus === 'sending' ? (
            <div>Loading...</div>
          ) : loadingStatus === 'error' ? (
            <ErrorRetry retry={fetchStudyVersion} />
          ) : (
            <>
              <PublishMatchForm />
              {studyVersions.map((sv) => (
                <TrialCard study={sv.study} key={sv.id}>
                  <BooleanLogicBuilder
                    studyVersions={studyVersions}
                    setStudyVersions={setStudyVersions}
                    studyVersion={sv}
                    gearboxState={gearboxState}
                    criteriaNotInMatchForm={criteriaNotInMatchForm}
                  />
                </TrialCard>
              ))}
            </>
          )}
        </TabPanel>
      ))}
    </Tabs>
  )
}
