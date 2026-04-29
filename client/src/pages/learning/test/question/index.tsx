/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import SendIcon from '@mui/icons-material/Send'
import FlagIcon from '@mui/icons-material/Flag'
import InfoIcon from '@mui/icons-material/Info'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { FormControl, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Collapse } from '@mui/material'
import QuillShow from '../../../../components/QuillEditor'

interface QuestionProps {
  question: any
  exam: any
  index: number
  pageQuestion: number
  isViewResult: boolean
  flaggedQuestions: Record<string, boolean>
  toggleFlag: (questionId: string, forcedState?: boolean) => void
  handleMultipleChoiceChange: (questionId: string, option: string) => void
  handleSingleChoiceChange: (e: React.ChangeEvent<HTMLInputElement>, questionId: string) => void
  answerCache: React.MutableRefObject<Record<string, any>>
  flagCache: React.MutableRefObject<Record<string, any>>
  userAnswers: Record<string, any>
  questionRefs: React.MutableRefObject<Array<HTMLDivElement | null>>
  questionDiscussion: Record<string, any[]>
  commentRefs: React.MutableRefObject<Record<string, HTMLTextAreaElement | null>>
  handlePostComment: (questionId: string) => Promise<void>
}

const Question: React.FC<QuestionProps> = ({
  question,
  exam,
  index,
  pageQuestion,
  isViewResult,
  flaggedQuestions,
  toggleFlag,
  handleMultipleChoiceChange,
  handleSingleChoiceChange,
  answerCache,
  flagCache,
  userAnswers,
  questionRefs,
  questionDiscussion,
  commentRefs,
  handlePostComment
}) => {
  const { t } = useTranslation()
  // Track local flag state
  const [localFlagged, setLocalFlagged] = useState(question.isFlagged || false)
  const [expandedComments, setExpandedComments] = useState<Record<string, Record<number, boolean>>>({})

  // Add this helper function to toggle comment expansion
  const toggleCommentExpansion = (questionId: string, commentIdx: number) => {
    setExpandedComments(prev => ({
      ...prev,
      [questionId]: {
        ...(prev[questionId] || {}),
        [commentIdx]: !(prev[questionId]?.[commentIdx] ?? false)
      }
    }))
  }
  // Track explanation expansion state
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false)

  // Use a ref to track the last database update we initiated
  const lastDbFlagState = useRef<boolean | null>(null)

  // Update local state whenever question.isFlagged changes
  useEffect(() => {
    setLocalFlagged(question.isFlagged || false)
    lastDbFlagState.current = question.isFlagged || false
  }, [question.isFlagged])

  // Also check flaggedQuestions for this question's ID
  useEffect(() => {
    if (flaggedQuestions && question.id in flaggedQuestions) {
      setLocalFlagged(!!flaggedQuestions[question.id])
      lastDbFlagState.current = !!flaggedQuestions[question.id]
    }
  }, [flaggedQuestions, question.id])

  // Update the flagCache whenever localFlagged changes
  const renderQuestionType = () => {
    if (question.type === 'MULTIPLE_CHOICE') {
      return (
        <FormControl component="fieldset" className="w-full">
          <FormGroup className="w-full">
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].map((option) =>
              question[option] != null && question[option] !== ''
                ? (
                  <FormControlLabel
                    key={option}
                    className="duration-75"
                    sx={{ width: '100%', '&:hover': { backgroundColor: '#f0f0f0' } }}
                    control={
                      <Checkbox
                        name={`question-${question.id}`}
                        disabled={isViewResult}
                        color="primary"
                        size="medium"
                        checked={answerCache.current[question.id]
                          ? answerCache.current[question.id].split('::').includes(option)
                          : false}
                        onChange={() => handleMultipleChoiceChange(question.id, option)}
                      />
                    }
                    label={(
                      <div className="flex items-center justify-between">
                        <QuillShow htmlContent={question[option] || ''} />
                        {isViewResult && exam?.answerVisible && renderAnswerStatus(option)}
                      </div>
                    )}
                  />
                  )
                : null
            )}
          </FormGroup>
        </FormControl>
      )
    } else if (question.type === 'SINGLE_CHOICE') {
      return (
        <FormControl component="fieldset" className="w-full">
          <RadioGroup className="w-full" name={`question-${question.id}`}>
            {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].map((option) =>
              question[option]
                ? (
                  <FormControlLabel
                    disabled={isViewResult}
                    key={option}
                    value={option}
                    control={<Radio color="primary" size="medium" onChange={(e) => handleSingleChoiceChange(e, question.id)} />}
                    label={(
                      <div className="flex items-center justify-between w-full">
                        <QuillShow htmlContent={question[option] || ''} />
                        {isViewResult && exam?.answerVisible && renderAnswerStatus(option)}
                      </div>
                    )}
                    checked={answerCache.current[question.id] === option}
                  />
                  )
                : null
            )}
          </RadioGroup>
        </FormControl>
      )
    }
    return null
  }

  const renderAnswerStatus = (option: string) => {
    const correctAnswers = question.correctAnswer ? question.correctAnswer.split('::') : []
    const userSelected = userAnswers[question.id] ? (userAnswers[question.id] as string).split('::') : []

    if (correctAnswers.includes(option)) {
      return <span className="ml-2 text-green-500 font-bold">✔</span>
    } else if (userSelected.includes(option)) {
      return <span className="ml-2 text-red-500 font-bold">✘</span>
    }
    return null
  }

  const renderExplanation = () => {
    if (!isViewResult || !exam?.answerVisible || !question.explanation || question.explanation.trim() === '') {
      return null
    }

    return (
      <div className="mt-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
            className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors duration-200 font-bold"
          >
            <InfoIcon className="text-lg" />
            <span>{t('course_exam.explanation')}</span>
            {isExplanationExpanded
              ? (
              <ExpandLessIcon className="text-lg" />
                )
              : (
              <ExpandMoreIcon className="text-lg" />
                )}
          </button>
        </div>

          <Collapse in={isExplanationExpanded}>
            <div className="mt-3 p-4 bg-green-100 border-l-4 border-green-400 rounded-r-lg">
              <div
                className="text-gray-700 leading-relaxed"
              >
                <QuillShow htmlContent={question.explanation || ''} />
              </div>
            </div>
          </Collapse>
      </div>
    )
  }

  return (
    <div key={index} ref={(el) => (questionRefs.current[index] = el)} className="mb-2">
      <div className={`p-4 shadow-2xl rounded-lg mb-4 ${isViewResult ? (question.isCorrect ? 'bg-green-50 border border-green-500' : 'bg-red-50 border border-red-500') : 'bg-white'}`}>
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold mb-2">
            {t('course_exam.question')} {(pageQuestion - 1) * 10 + index + 1}:
          </h2>
          <div className="text-sm mb-1 text-gray-400 font-bold">
            {question.type === 'MULTIPLE_CHOICE'
              ? t('course_exam.multiple_choice')
              : question.type === 'SINGLE_CHOICE' ? t('course_exam.single_choice') : t('course_exam.fill_in_blank')}
          </div>
          {!isViewResult && (
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                toggleFlag(question.id)
              }}
              className={`p-2 rounded-full transition-transform hover:scale-105 ${flagCache.current[question.id] === 'true' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-600'
                }`}
            >
              <FlagIcon />
            </button>
          )}
        </div>
        <div className="font-bold select-none" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
          <QuillShow htmlContent={question.title || ''} />
        </div>
        <div className="mt-4">
          {renderQuestionType()}

          {/* Explanation Section */}
          {renderExplanation()}

          {/* {isViewResult && questionDiscussion && questionDiscussion[question.id] && questionDiscussion[question.id].length > 0 && (
            <div className="mt-4 border-t pt-3">
              <h3 className="text-lg font-semibold mb-2">{t('course_exam.discussion')}</h3>
              <div className="space-y-3">
                {questionDiscussion[question.id].map((comment: any, idx: number) => (
                  <div key={idx} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-gray-800">
                        {comment.firstName} {comment.lastName} (<span className="text-sm text-gray-600">@{comment.username}</span>)
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.updatedAt).toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-2 text-gray-700">{comment.comment}</div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
          {isViewResult && questionDiscussion && questionDiscussion[question.id] && questionDiscussion[question.id].length > 0 && (
  <div className="mt-4 border-t pt-3">
    <h3 className="text-lg font-semibold mb-2">{t('course_exam.discussion')}</h3>
    <div className="space-y-3">
      {questionDiscussion[question.id].map((comment: any, idx: number) => {
        const isExpanded = expandedComments[question.id]?.[idx] ?? false
        const commentText = comment.comment || ''
        const isLongComment = commentText.length > 150
        return (
          <div key={idx} className="p-4 bg-gray-100 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
              <div className="font-semibold text-gray-800">
                {comment.firstName} {comment.lastName} (<span className="text-sm text-gray-600">@{comment.username}</span>)
              </div>
              <div className="text-xs text-gray-500">
                {new Date(comment.updatedAt).toLocaleString()}
              </div>
            </div>
            <div className="mt-2 text-gray-700">
              {isLongComment
                ? (
                <>
                  <span>
                    {isExpanded ? commentText : `${commentText.substring(0, 150)}...`}
                  </span>
                  <button
                    className="ml-2 text-blue-500 hover:text-blue-700 text-xs flex items-center"
                    onClick={() => setExpandedComments(prev => ({
                      ...prev,
                      [question.id]: {
                        ...(prev[question.id] || {}),
                        [idx]: !isExpanded
                      }
                    }))}
                  >
                    {isExpanded
                      ? (
                      <>
                        <ExpandLessIcon fontSize="small" /> {t('course_exam.show_less')}
                      </>
                        )
                      : (
                      <>
                        <ExpandMoreIcon fontSize="small" /> {t('course_exam.show_more')}
                      </>
                        )}
                  </button>
                </>
                  )
                : (
                    commentText
                  )}
            </div>
          </div>
        )
      })}
    </div>
  </div>
          )}
          {isViewResult && (
            <div className="mt-6 bg-white p-4 border rounded-lg shadow-md flex items-center">
              <div className="relative w-full flex items-center border border-gray-300 rounded-md">
                <textarea
                  ref={(el) => (commentRefs.current[question.id] = el)}
                  className="w-full py-2 px-4 pr-10 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-500"
                  placeholder={`💬 ${t('exam_result.write_new_comment')}`}
                  maxLength={500}
                />
                <div className="absolute right-2 flex items-center space-x-2">
                  <span className="border-l h-5 border-gray-300"></span>
                  <button className="text-blue-500 p-1 rounded-md transition flex items-center justify-center" onClick={async () => await handlePostComment(question.id)}>
                    <SendIcon fontSize='medium' />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Question
