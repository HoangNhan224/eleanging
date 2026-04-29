/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: ExamAdd
========================================================================== */
import React from 'react'
import { useNavigate } from 'react-router-dom'
import HeaderComponent from './HeaderExam'
import BasicInfo from './tabs/BasicInfo'

/**
 * ExamAdd component for adding a new exam.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered ExamAdd component.
 */
const ExamAdd = () => {
  // TODO: Initialize useNavigate hook
  const navigate = useNavigate()

  /**
   * Handles the event after an exam is created successfully.
   *
   * @author Hien
   * @param {string} newExamId - The ID of the newly created exam.
   */
  const handleCreated = (newExamId: string) => {
    // TODO: After successful creation, navigate to the exam edit page with the "compose" tab active
    navigate(`/exam-management/edit/${newExamId}`, { state: { activeTab: 'compose' } })
  }

  return (
    <div>
      <HeaderComponent
        activeTab="basic"
        onTabChange={() => {}}
      />
      <div>
        <BasicInfo addMode={true} onCreated={handleCreated} />
      </div>
    </div>
  )
}

export default ExamAdd
