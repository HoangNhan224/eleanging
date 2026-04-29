/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: DASHBOARD
   ========================================================================== */

// TODO: remove later

import { getDashboardData, saveQuestionsForExam } from 'api/post/post.api'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Checkbox from '@mui/material/Checkbox'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import LoadingButton from '@mui/lab/LoadingButton'
import Styled from './index.style'
import Typography from '@mui/material/Typography'
import { useTranslation } from 'react-i18next'
/**
 * Dashboard component displays the list of exams and their associated questions.
 * It allows for selecting and saving questions for each exam.
 * The component fetches data on mount and updates the UI accordingly based on user interactions.
 *
 * It uses material-UI components to create an accordion-style UI where each exam can be expanded
 * to show its related questions. Users can select questions and save them for the exam.
 *
 * @author Canh
 * @component
 * @returns {JSX.Element} The rendered Dashboard component.
 *
 * @property {any} data - The state for storing the fetched dashboard data, including exam information and questions.
 * @property {any} checked - The state to track which questions are selected for each exam.
 * @property {string} loading - The state to track which exam is currently being processed (for loading indication).
 *
 * @method parseCheck - A callback function that parses the exam questions data to track selected questions.
 * @method fetchData - A callback function that fetches the dashboard data (exams and questions) and populates the state.
 * @method handleToggle - A callback function to toggle the selection state of a question for a given exam.
 * @method handleSaveQuestionsForExam - A callback function to save the selected questions for a given exam and refresh the data.
 * @method getListQuestions - A callback function to render the list of questions for a given exam, with checkboxes to select questions.
 *
 * @example
 * <Dashboard />
 */

const Dashboard = () => {
  const { t } = useTranslation()
  const [data, setData] = useState<any>(null)
  const [checked, setChecked] = useState<any>({})
  const [loading, setLoading] = useState<string>('')
  /**
   * Parses and organizes the exam questions into a structured format.
   * The function creates a mapping of exam IDs to an array of question IDs.
   * It updates the `checked` state to reflect the selected questions for each exam.
   *
   * @author Canh
   * @param {any[]} examQuestions - The array of exam questions to be parsed.
   */
  const parseCheck = useCallback((examQuestions: any[]) => {
    const result: any = {}
    examQuestions.forEach((data: any) => {
      const examId = (data?.examId as string) || ''
      if (!result[examId]) {
        result[examId] = []
      }
      result[examId].push(data?.questionId)
    })
    setChecked(result)
  }, [])
  /**
   * Fetches the dashboard data, including exams and questions.
   * It retrieves data from the API and updates the component state accordingly.
   * Also calls `parseCheck` to structure the exam question data.
   *
   * @author Canh
   */
  const fetchData = useCallback(async () => {
    try {
      const response = await getDashboardData()
      setData(response.data)
      parseCheck(response.data?.examsQuestions)
    } catch (error) {
      setData(null)
    }
  }, [parseCheck])

  useEffect(() => {
    fetchData()
  }, [])
  /**
   * Toggles the selection of a question for a specific exam.
   * Updates the `checked` state to reflect the newly selected or deselected questions.
   *
   * @author Canh
   * @param {string} examId - The ID of the exam to which the question belongs.
   * @param {string} questionId - The ID of the question being toggled.
   * @returns {Function} - The function that handles the toggle action.
   */
  const handleToggle = useCallback(
    (examId: string, questionId: string) => () => {
      const currentIndex = checked?.[examId]?.indexOf?.(questionId)
      const newChecked = { ...checked }

      if (currentIndex >= 0) {
        newChecked[examId].splice(currentIndex, 1)
      } else {
        if (!newChecked[examId]) {
          newChecked[examId] = []
        }
        newChecked[examId].push(questionId)
      }

      setChecked(newChecked)
    },
    [checked]
  )
  /**
   * Saves the selected questions for a specific exam.
   * It sends a request to the API with the selected question IDs for the given exam.
   * Updates the state after saving the questions.
   *
   * @author Canh
   * @param {string} examId - The ID of the exam to which the questions belong.
   * @returns {Function} - The function that handles saving the questions.
   */
  const handleSaveQuestionsForExam = useCallback(
    (examId: string) => async (event: any) => {
      setLoading(examId)
      try {
        event?.stopPropagation?.()
        await saveQuestionsForExam({
          examId,
          questionIds: checked[examId]
        })
        await fetchData()
        setLoading('')
      } catch (error) {
        setLoading('')
        console.log(error)
      }
    },
    [checked, fetchData]
  )
  /**
   * Generates a list of questions for a specific exam.
   * It displays a list of question titles with checkboxes to select or deselect questions.
   *
   * @author Canh
   * @param {string} examId - The ID of the exam whose questions are being displayed.
   * @returns {JSX.Element} - A list of questions for the given exam.
   */
  const getListQuestions = useCallback(
    (examId: string) => {
      return (
        <List
          sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        >
          {(data?.questions || []).map((question: any) => {
            const labelId = `checkbox-list-label-${question.id}`

            return (
              <Styled.Wrap key={question.id} disablePadding>
                <ListItemButton
                  role={undefined}
                  onClick={handleToggle(examId, question.id)}
                  dense
                >
                  <ListItemIcon>
                    <Checkbox
                      edge="start"
                      checked={checked?.[examId]?.indexOf?.(question.id) >= 0}
                      tabIndex={-1}
                      disableRipple
                      inputProps={{ 'aria-labelledby': labelId }}
                    />
                  </ListItemIcon>
                  <ListItemText id={labelId} primary={question.title} />
                </ListItemButton>
              </Styled.Wrap>
            )
          })}
        </List>
      )
    },
    [checked, data?.questions, handleToggle]
  )

  const content = useMemo(() => {
    return (data?.exams || []).map((exam: any) => {
      return (
        <Accordion key={exam.id}>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
          >
            <Styled.Summary>
              <Typography>{t('dashboard_admin.exam_name')}: {exam?.name || ''}</Typography>
              <LoadingButton
                loading={exam.id === loading}
                variant="outlined"
                onClick={handleSaveQuestionsForExam(exam.id)}
              >
                {t('dashboard_admin.save_questions_for_this_exam')}
              </LoadingButton>
            </Styled.Summary>
          </AccordionSummary>
          <AccordionDetails>{getListQuestions(exam.id)}</AccordionDetails>
        </Accordion>
      )
    })
  }, [data?.exams, getListQuestions, handleSaveQuestionsForExam, loading])

  return <Styled.Container>{content}</Styled.Container>
}

export default Dashboard
