/* eslint-disable no-return-assign */
/* eslint-disable react/jsx-key */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable multiline-ternary */
/* eslint-disable react/jsx-no-undef */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/prop-types */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: DetailedExamResults
========================================================================== */
import React, { useState, useEffect, useRef } from 'react'
import { ClipLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'
import { getUserResultDetail, getQuestionDiscussion, commentOnQuestion } from '../../../../api/post/post.api'
import { toast } from 'react-toastify'
import SendIcon from '@mui/icons-material/Send'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import { FormControl, RadioGroup, FormControlLabel, Radio, FormGroup, Checkbox, Collapse } from '@mui/material'
import InfoIcon from '@mui/icons-material/Info'
import Pagination from '@mui/material/Pagination'
import QuillShow from '../../../../components/QuillEditor'

interface Question {
  id: number
  content: string
  type: string
  a?: string
  b?: string
  c?: string
  d?: string
  e?: string
  f?: string
  g?: string
  h?: string
  i?: string
  j?: string
  k?: string
  l?: string
  m?: string
  n?: string
  o?: string
  p?: string
  userAnswer?: string
  correctAnswer?: string
  isCorrect?: boolean
  score?: number
  explanation?: string
  [key: string]: any
}

interface ExamDetail {
  userId: string
  examId: string
  attempt: number
  examName: string
  score: number | null
  numberOfAttempt: number
  enterTime: string | null
  exitTime: string | null
  questions: Question[]
  meta?: {
    total: number
    start: number
    size: number
    totalPages: number
    currentPage: number
  }
}

interface Props {
  visible: boolean
  onClose: () => void
  userId: string
  examId: string
  attempt: number
}

const DetailedExamResultsModal: React.FC<Props> = ({ visible, onClose, userId, examId, attempt }) => {
  const { t } = useTranslation()
  const [isExplanationExpanded, setIsExplanationExpanded] = useState(false)
  const [examDetail, setExamDetail] = useState<ExamDetail | null>(null)
  const [initialLoading, setInitialLoading] = useState(false) // Loading modal
  const [paginationLoading, setPaginationLoading] = useState(false) // Loading pagination
  const [questionDiscussion, setQuestionDiscussion] = useState<Record<string, any[]>>({})
  const [newComments, setNewComments] = useState<Record<string, string>>({})
  const questionRefs = useRef<Array<HTMLDivElement | null>>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })

  useEffect(() => {
    if (visible) {
      setExamDetail(null)
      setInitialLoading(true)
      setQuestionDiscussion({})
      setNewComments({})
      setIsExplanationExpanded(false)
      setPagination({
        pageIndex: 0,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0
      })
      questionRefs.current = []
    } else {
      setExamDetail(null)
      setInitialLoading(false)
      setPaginationLoading(false)
      setQuestionDiscussion({})
      setNewComments({})
      setIsExplanationExpanded(false)
      setPagination({
        pageIndex: 0,
        pageSize: 10,
        totalPages: 0,
        totalItems: 0
      })
      questionRefs.current = []
    }
  }, [visible])
  useEffect(() => {
    const fetchExamDetail = async () => {
      if (!examDetail) {
        setInitialLoading(true)
      } else {
        setPaginationLoading(true)
      }

      try {
        const start = pagination.pageIndex * pagination.pageSize
        const response = await getUserResultDetail({
          userId,
          examId,
          attempt,
          start,
          size: pagination.pageSize
        })
        if (response.status !== 200) {
          throw new Error('Failed to fetch exam detail')
        }
        const data = response.data

        if (data.meta) {
          setPagination(prev => ({
            ...prev,
            totalItems: data.meta.total,
            totalPages: data.meta.totalPages
          }))
        }

        setExamDetail(data)
      } catch (error) {
        setExamDetail(null)
      } finally {
        setInitialLoading(false)
        setPaginationLoading(false)
      }
    }

    if (visible) fetchExamDetail()
  }, [visible, userId, examId, attempt, pagination.pageIndex, pagination.pageSize])

  useEffect(() => {
    const fetComment = async () => {
      try {
        const questionIds = examDetail?.questions?.map((question: any) => question.id) || []
        questionIds.forEach(async (questionId: any) => {
          const response = await getQuestionDiscussion({ id: questionId })
          if (response) {
            setQuestionDiscussion((prev: any) => ({
              ...prev,
              [questionId]: response.data
            }))
          }
        })
      } catch (error) {
        toast.error(t('exam_result.error_fetch_exam'))
      }
    }

    fetComment()
  }, [examDetail])

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start || !end) return ''
    const diff = new Date(end).getTime() - new Date(start).getTime()
    const seconds = Math.floor(diff / 1000)
    const hh = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const ss = String(seconds % 60).padStart(2, '0')
    return `${hh}:${mm}:${ss}`
  }

  const handleCommentChange = (questionId: string, value: string) => {
    setNewComments((prev) => ({ ...prev, [questionId]: value }))
  }

  const handlePostComment = async (questionId: string) => {
    const commentContent = newComments[questionId]
    if (!commentContent) return
    try {
      const payload = { comment: commentContent }
      const response = await commentOnQuestion(questionId, payload)
      if (response.data) {
        setQuestionDiscussion((prev: any) => ({
          ...prev,
          [questionId]: [...(prev[questionId] || []), response.data]
        }))
        setNewComments((prev: any) => ({ ...prev, [questionId]: '' }))
      }
    } catch (error) {
      toast.error(t('exam_result.error_post_comment'))
    }
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-lg shadow-xl w-4/5">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div></div>
          <h2 className="text-2xl font-semibold text-gray-800">{t('exam_result.detailed_results')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="h-[80vh] flex">
          {initialLoading ? (
            <div className="flex items-center justify-center w-full h-full">
              <ClipLoader color="#5EEAD4" loading={initialLoading} size={40} />
            </div>
          ) : examDetail ? (
            <>
              {/* Left side: Exam results summary */}
              <div className='w-1/3 p-2'>
                <div className="p-6 rounded-lg shadow border border-gray-200 h-full flex-shrink-0 flex flex-col">
                  <h3 className="text-xl font-bold text-green-600 mb-4 flex items-center">
                    📊 {t('exam_result.test_results')}
                  </h3>
                  <div className="space-y-2 text-lg">
                  <p className="flex items-start flex-wrap">
                    📝 <span className="ml-2 flex-shrink-0">{t('exam_result.exam_name')}:</span>
                    <strong className="ml-2 break-words leading-relaxed text-gray-800">
                      {examDetail.examName}
                    </strong>
                  </p>
                    <p className="flex items-center">
                      🔄 <span className="ml-2">{t('exam_result.attempt')}:</span>
                      <strong className="ml-2">{examDetail.attempt}/{examDetail.numberOfAttempt}</strong>
                    </p>
                    <p className="flex items-center">
                      🎯 <span className="ml-2">{t('exam_result.score')}:</span>
                      <strong className="ml-2 text-red-600">{examDetail.score}</strong>
                    </p>
                    <p className="flex items-center">
                      ⏳ <span className="ml-2">{t('exam_result.done_in')}:</span>
                      <strong className="ml-2 text-gray-700">
                        {formatDuration(examDetail.enterTime, examDetail.exitTime)}
                      </strong>
                    </p>
                  </div>
                  <hr className="my-4" />

                  {/* Table list questions */}
                  {(initialLoading || paginationLoading) ? (
                    <div className="grid grid-cols-5 gap-2 min-h-36">
                      <div className="flex items-center justify-center w-full h-full col-span-5">
                        <ClipLoader color="#5EEAD4" loading={true} size={20} />
                      </div>
                    </div>
                  ) : (
                  <div className="grid grid-cols-5 gap-2 min-h-36">
                    {Array.from({ length: Math.min(pagination.pageSize, pagination.totalItems - (pagination.pageIndex * pagination.pageSize)) }, (_, idx) => {
                      const questionNumber = (pagination.pageIndex * pagination.pageSize) + idx + 1
                      const question = examDetail.questions?.[idx]
                      return (
                        <div key={`question-${questionNumber}`} className="w-16 h-14 flex flex-col items-center">
                          <div
                            onClick={() => {
                              if (question) {
                                questionRefs.current[idx]?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                              }
                            }}
                            className={`w-full h-full flex flex-col items-center justify-center font-bold rounded-lg border transition-colors duration-200 cursor-pointer hover:bg-gray-200 ${question?.isCorrect === true ? 'bg-green-200 text-green-700 border-green-500' : question?.isCorrect === false ? 'bg-red-200 text-red-700 border-red-500' : ''}`}
                          >
                            <span className="text-lg">{questionNumber}</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  )}
                  <div className="mt-4 flex justify-center">
                    {pagination.totalPages > 1 && (
                      <Pagination
                        count={pagination.totalPages}
                        page={pagination.pageIndex + 1}
                        onChange={(_, value) => {
                          setPagination(prev => ({
                            ...prev,
                            pageIndex: value - 1
                          }))
                        }}
                        showFirstButton
                        showLastButton
                        size="medium"
                        color="primary"
                        disabled={paginationLoading}
                      />
                    )}
                  </div>
                </div>
              </div>

              <div className="w-px bg-gray-300 mx-2 h-full self-stretch" />

              {/* Right side: Detailed questions */}
              <div className="w-2/3 overflow-y-auto h-full">
                {paginationLoading ? (
                  <div className="flex items-center justify-center w-full h-full">
                    <ClipLoader color="#5EEAD4" loading={paginationLoading} size={40} />
                  </div>
                ) : (
                  <div className="bg-white p-2 rounded-lg shadow">
                    {examDetail?.questions?.map((question: any, index: number) => {
                      const correctAnswers = question?.correctAnswer?.split('::') || []
                      const userAnswers = question?.userAnswer?.split('::') || []
                      const questionNumber = (pagination.pageIndex * pagination.pageSize) + index + 1

                      return (
                        <div
                          ref={(el) => questionRefs.current[index] = el}
                          key={question?.id}
                          className={`mb-6 p-5 border rounded-xl shadow-md 
                            ${question.isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}
                        >
                          {/* Tiêu đề câu hỏi */}
                          <div className="flex justify-between items-center">
                            <h2 className="text-xl font-semibold mb-2">
                              {question.isCorrect ? '✅' : '❌'}
                              <span className="ml-2">{t('exam_result.question')} {questionNumber}:</span>
                            </h2>
                            <div className="text-sm mb-1 text-gray-400 font-bold">
                              {question.type === 'MULTIPLE_CHOICE'
                                ? t('exam_result.multiple_choice')
                                : question.type === 'SINGLE_CHOICE'
                                  ? t('exam_result.single_choice')
                                  : question.type}
                            </div>
                          </div>

                          {/* Question Title */}
                          <div
                            className="font-bold select-none mb-4"
                            onCopy={(e) => e.preventDefault()}
                            onContextMenu={(e) => e.preventDefault()}
                          >
                            <QuillShow htmlContent={question?.content || ''} />
                          </div>
                          {/* Question Options */}
                          <div className="mt-4">
                            {question.type === 'MULTIPLE_CHOICE' ? (
                              <FormControl component="fieldset" className="w-full">
                                <FormGroup className="w-full">
                                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].map((option) =>
                                    question[option] != null && question[option] !== ''
                                      ? (
                                        <FormControlLabel
                                          key={option}
                                          className="duration-75"
                                          sx={{ width: '100%' }}
                                          control={
                                            <Checkbox
                                              name={`question-${question.id}`}
                                              disabled={true}
                                              color="primary"
                                              size="medium"
                                              checked={userAnswers.includes(option)}
                                            />
                                          }
                                          label={(
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center">
                                                <span className="font-bold uppercase mr-2">{option}.</span>
                                                <QuillShow htmlContent={question[option] || ''} />
                                              </div>
                                              <div className="flex-shrink-0">
                                                {correctAnswers.includes(option) && (
                                                  <span className="ml-2 text-green-500 font-bold">✔</span>
                                                )}
                                                {userAnswers.includes(option) && !correctAnswers.includes(option) && (
                                                  <span className="ml-2 text-red-500 font-bold">✖</span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        />
                                        )
                                      : null
                                  )}
                                </FormGroup>
                              </FormControl>
                            ) : question.type === 'SINGLE_CHOICE' ? (
                              <FormControl component="fieldset" className="w-full">
                                <RadioGroup className="w-full" name={`question-${question.id}`}>
                                  {['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p'].map((option) =>
                                    question[option]
                                      ? (
                                        <FormControlLabel
                                          disabled={true}
                                          key={option}
                                          value={option}
                                          sx={{ width: '100%' }}
                                          control={<Radio color="primary" size="medium" checked={userAnswers.includes(option)} />}
                                          label={(
                                            <div className="flex items-center justify-between w-full">
                                              <div className="flex items-center">
                                                <span className="font-bold uppercase mr-2">{option}.</span>
                                                <QuillShow htmlContent={question[option] || ''} />
                                              </div>
                                              <div className="flex-shrink-0">
                                                {correctAnswers.includes(option) && (
                                                  <span className="ml-2 text-green-500 font-bold">✔</span>
                                                )}
                                                {userAnswers.includes(option) && !correctAnswers.includes(option) && (
                                                  <span className="ml-2 text-red-500 font-bold">✖</span>
                                                )}
                                              </div>
                                            </div>
                                          )}
                                        />
                                        )
                                      : null
                                  )}
                                </RadioGroup>
                              </FormControl>
                            ) : null}

                            {/* Explanation Section */}
                            {question?.explanation && (
                              <div className="mt-4 border-t pt-4">
                                <div className="flex items-center justify-between">
                                  <button
                                    type="button"
                                    onClick={() => setIsExplanationExpanded(!isExplanationExpanded)}
                                    className="flex items-center space-x-2 text-green-600 hover:text-green-800 transition-colors duration-200 font-bold"
                                  >
                                    <InfoIcon className="text-lg" />
                                    <span>{t('exam_result.explanation')}</span>
                                    {isExplanationExpanded ? (
                                      <ExpandLessIcon className="text-lg" />
                                    ) : (
                                      <ExpandMoreIcon className="text-lg" />
                                    )}
                                  </button>
                                </div>

                                <Collapse in={isExplanationExpanded}>
                                  <div className="mt-3 p-4 bg-green-50 border-l-4 border-green-400 rounded-r-lg">
                                    <div
                                      className="text-gray-700 leading-relaxed"
                                    >
                                      <QuillShow htmlContent={question?.explanation || ''} />
                                    </div>
                                  </div>
                                </Collapse>
                              </div>
                            )}

                            {/* Discussion Section */}
                            {questionDiscussion &&
                              questionDiscussion[question.id] &&
                              questionDiscussion[question.id].length > 0 && (
                                <div className="mt-4 border-t pt-3">
                                  <h3 className="text-lg font-semibold mb-2">{t('exam_result.discussion')}</h3>
                                  <div className="space-y-3">
                                    {questionDiscussion[question.id]?.map((comment: any, idx: number) => (
                                      <div key={idx} className="p-4 bg-gray-100 rounded-lg shadow-sm">
                                        <div className="flex items-center justify-between">
                                          <div className="font-semibold text-gray-800">
                                            {comment?.firstName} {comment?.lastName}
                                            <span className="text-sm text-gray-600"> (@{comment?.username})</span>
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {new Date(comment.updatedAt).toLocaleString()}
                                          </div>
                                        </div>
                                        <div className="mt-2 text-gray-700">{comment?.comment}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                            )}

                            {/* New Comment Section */}
                            <div className="mt-6 bg-white p-4 border rounded-lg shadow-md flex items-center">
                              <div className="relative w-full flex items-center border border-gray-300 rounded-md">
                                <textarea
                                  className="w-full py-2 px-4 pr-10 resize-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-500"
                                  placeholder={`💬 ${t('exam_result.write_new_comment')}`}
                                  value={newComments[question.id] || ''}
                                  onChange={(e) => handleCommentChange(question.id, e.target.value)}
                                />
                                <div className="absolute right-2 flex items-center space-x-2">
                                  <span className="border-l h-5 border-gray-300"></span>
                                  <button
                                    className="text-blue-500 p-1 rounded-md transition flex items-center justify-center"
                                    onClick={async () => await handlePostComment(question.id)}
                                  >
                                    <SendIcon fontSize='medium' />
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-center">
          <button
            onClick={onClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">
            {t('exam_result.close')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailedExamResultsModal
