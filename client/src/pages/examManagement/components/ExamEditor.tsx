/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: ExamEditor
========================================================================== */
import React, { useState, useEffect } from 'react'
import { useParams, useLocation, Navigate } from 'react-router-dom'
import HeaderComponent from './HeaderExam'
import BasicInfo from './tabs/BasicInfo'
import ComposeQuestion from './tabs/ComposeQuestion'
import AdvancedSettings from './tabs/AdvancedSettings'
import Statistics from './tabs/Statistics'

/**
 * ExamEditor component for editing an existing exam.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered ExamEditor component.
 */
const ExamEditor = () => {
  // TODO: Initialize useParams hook to get the exam ID from the URL
  const { id: rawId } = useParams<{ id: string }>()
  // TODO: Convert the raw ID to a number
  const examId = rawId ? Number(rawId) : undefined
  // TODO: Validate ID - if not a pure number, redirect
  if (rawId && !/^\d+$/.test(rawId)) {
    return <Navigate to="/*" replace />
  }
  // TODO: Initialize useLocation hook to get the active tab from the location state
  const location = useLocation() as { state: { activeTab?: string } }
  // TODO: Get the initial tab from the location state or default to "basic"
  const initialTab = location.state?.activeTab || 'basic'
  // TODO: Initialize state for the active tab
  const [activeTab, setActiveTab] = useState(initialTab)

  // TODO: Update activeTab when location.state changes
  useEffect(() => {
    const newActiveTab = location.state?.activeTab || 'basic'
    setActiveTab(newActiveTab)
  }, [location.state?.activeTab])

  /**
   * Renders the content based on the active tab.
   *
   * @author Hien
   * @returns {JSX.Element} The content to render based on the active tab.
   */
  const renderContent = () => {
    switch (activeTab) {
      case 'basic':
        return <BasicInfo examId={examId} />
      case 'compose':
        return <ComposeQuestion examId={examId} />
      case 'advanced':
        return <AdvancedSettings examId={examId} />
      case 'statistics':
        return <Statistics examId={examId} />
      default:
        return <BasicInfo examId={examId} />
    }
  }

  return (
    <div>
      <HeaderComponent activeTab={activeTab} onTabChange={setActiveTab}/>
      <div>
        {renderContent()}
      </div>
    </div>
  )
}

export default ExamEditor
