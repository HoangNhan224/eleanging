// ComposeQuestion.tsx
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/promise-function-async */

/* eslint-disable @typescript-eslint/no-unused-vars */
// QuestionPage.tsx
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState, useEffect } from 'react'
import AddQuestionForm from '../../../questionManagement/components/AddQuestionForm'
import EditQuestionForm from '../../../questionManagement/components/EditQuestionForm'
import { getQuestionExamPagination, removeQuestionFromExam, getExamById, createQuestion } from 'api/post/post.api'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import AddTextQuestionModal from '../AddTextQuestionModal'
import SortQuestionModal from '../SortQuestionModal'
import DualTableDragModal from '../DualTableDragModal'
import { Answer, Question } from '../../../../api/post/post.interface'
import { useTranslation } from 'react-i18next'
import ModalComponent from '../../../../components/Modal'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ClickAwayListener from '@mui/material/ClickAwayListener'
import { Tooltip } from '@mui/material'
import Pagination from '@mui/material/Pagination'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import QuillShow from '../../../../components/QuillEditor'

const removeImagesFromHtml = (html: string): string => {
  return html.replace(/<img[^>]*>/gi, '')
}

const ExamQuestionItem = ({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  handleCopyQuestion,
  highlighted
}: {
  question: Question
  index: number
  isSelected: boolean
  onSelect: (id: number) => void
  onDelete: (question: Question) => void
  handleCopyQuestion: (question: Question) => void
  highlighted: boolean
}) => {
  const { t } = useTranslation()
  // Initialize state for showing/hiding question details
  const [showDetails, setShowDetails] = useState(false)
  // Add state for dropdown menu
  const [showDropdown, setShowDropdown] = useState(false)

  /**
   * Renders the question content based on whether details are shown or not.
   */
  const renderContent = () =>
    showDetails
      ? <QuillShow htmlContent={question.content || ''} />
      : <QuillShow htmlContent={removeImagesFromHtml(question.content || '')} />

  return (
    <div className={`relative bg-gray-50 border-2 rounded-md flex mb-2
      ${isSelected ? 'bg-green-500' : 'border-gray-200'} 
      ${question.Exams && question.Exams.length > 0 ? 'pt-6 pl-3 pr-3 pb-3' : 'p-3'}
      ${highlighted ? 'animate-fade-right' : ''}`}>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <span className="font-bold">{t('question_bank_admin.question')} {index + 1}:</span>
          <div className="flex items-center space-x-3">
            <Tooltip title={t('question_bank_admin.show_hide_details')}>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-sm text-blue-500 focus:outline-none w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-full"
              >
                {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </button>
            </Tooltip>

            <ClickAwayListener onClickAway={() => setShowDropdown(false)}>
              <div className="flex items-center space-x-3">
                {showDropdown && (
                  <>
                    <Tooltip title={t('question_bank_admin.edit_question')}>
                      <button
                        className="flex items-center justify-center text-blue-500 hover:bg-gray-100 rounded-full"
                        onClick={() => {
                          onSelect(question.id)
                          setShowDropdown(false)
                        }}
                      >
                        <EditIcon style={{ fontSize: 15 }} />
                      </button>
                    </Tooltip>

                       <Tooltip title={t('question_bank_admin.copy_question')}>
                                            <button
                                              className="flex items-center justify-center text-blue-500 hover:bg-gray-100 rounded-full"
                                              onClick={() => {
                                                handleCopyQuestion(question)
                                                setShowDropdown(false)
                                              }}
                                            >
                                              <ContentCopyRoundedIcon style={{ fontSize: 15 }} />
                                            </button>
                                          </Tooltip>

                      <Tooltip title={t('question_bank_admin.remove_question')}>
                        <button
                          className="flex items-center justify-center text-red-500 hover:bg-gray-100 rounded-full"
                          onClick={(e) => {
                            e.stopPropagation()
                            onDelete(question)
                            setShowDropdown(false)
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </Tooltip>
                  </>
                )}

                <Tooltip title=''>
                  <button
                    className="flex items-center justify-center text-gray-600 hover:bg-gray-200 rounded-full"
                    onClick={() => setShowDropdown(!showDropdown)}
                  >
                    <MoreVertIcon style={{ fontSize: 15 }} />
                  </button>
                </Tooltip>
              </div>
            </ClickAwayListener>
          </div>
        </div>
        <div className="ml-0">
          {renderContent()}
          {showDetails && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <div>
                <strong>{t('question_bank_admin.question_type')}:</strong>{' '}
                {question.type === 'SINGLE_CHOICE' ? t('question_bank_admin.one_answer') : t('question_bank_admin.multiple_answers')}
              </div>
              <div>
                <strong>{t('question_bank_admin.instruction')}:</strong>{' '}
                <div className="inline-block align-top [&_p]:!my-0 [&_.ql-editor]:!p-0">
                  <QuillShow htmlContent={question?.instruction} />
                </div>
              </div>
              {question.answers && question.answers.length > 0 && (
                <div className="my-2">
                  <ul>
                    {question.answers.map((ans, i) => (
                      <li key={i} className="flex items-center">
                        <div className="w-5 flex-shrink-0">
                        {ans.isCorrect
                          ? <span className="ml-2 text-green-500 font-bold">✔</span>
                        // : <CancelIcon className="h-5 w-5 text-red-500" />
                          : <div className="h-5 w-5"></div>
                        }
                        </div>
                        <div className="flex items-center ml-2">
                          <span className="font-medium mr-1">{String.fromCharCode(65 + i)}. </span>
                          <QuillShow htmlContent={ans.content || ''} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <strong>{t('question_bank_admin.explanation')}:</strong>{' '}
                <QuillShow htmlContent={question.explanation || ''} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface ComposeQuestionProps {
  examId?: number
}

/**
 * ComposeQuestion component for managing questions in an exam.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered ComposeQuestion component.
 */
const ComposeQuestion: React.FC<ComposeQuestionProps> = ({ examId }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize state for the questions
  const [questions, setQuestions] = useState<Question[]>([])
  const [examDetail, setExamDetail] = useState<any>(null)
  // TODO: Initialize state for the selected question
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  // TODO: Initialize state for the adding question flag
  const [isAddingQuestion, setIsAddingQuestion] = useState(true)
  // TODO: Initialize state for the selected question ID
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  // TODO: Initialize state for the open delete modal flag
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  // TODO: Initialize state for the question to delete
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  // TODO: Initialize state for the loading indicator
  const [loading, setLoading] = useState(false)
  // TODO: Initialize state for the loading indicator for the question list
  const [listLoading, setListLoading] = useState(false)
  // TODO: Initialize state for the show sort modal flag
  const [showSortModal, setShowSortModal] = useState(false)
  // TODO: Initialize state for the show dual table modal flag
  const [showDualTableModal, setShowDualTableModal] = useState(false)
  // TODO: Initialize state for the active mode
  const [activeMode, setActiveMode] = useState<'adding' | 'text' | 'sorting' | 'dualtable' | ''>('adding')
  // TODO: Initialize state for highlighted question id
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null)
  // TODO: Initialize state for refresh counter
  const [refreshCounter, setRefreshCounter] = useState(0)
  // TODO: Use useRef to reference the questions container
  const questionsContainerRef = React.useRef<HTMLDivElement>(null)
  // TODO: Initialize state for pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })
  /**
   * Fetches the questions for the exam.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const fetchQuestions = async () => {
    setListLoading(true)
    try {
      const response = await getQuestionExamPagination({
        examId: examId ?? 0,
        start: pagination.pageIndex * pagination.pageSize,
        size: pagination.pageSize
      })
      const mockQuestions = response.data.data
      const totalItems = response.data.meta?.total || mockQuestions.length
      const totalPages = Math.ceil(totalItems / pagination.pageSize)

      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages
      }))
      const formattedQuestions = mockQuestions.map((question: any) => {
        const answers = []
        if (question.a) answers.push({ content: question.a, isCorrect: question.answer.includes('a') })
        if (question.b) answers.push({ content: question.b, isCorrect: question.answer.includes('b') })
        if (question.c) answers.push({ content: question.c, isCorrect: question.answer.includes('c') })
        if (question.d) answers.push({ content: question.d, isCorrect: question.answer.includes('d') })
        if (question.e) answers.push({ content: question.e, isCorrect: question.answer.includes('e') })
        if (question.f) answers.push({ content: question.f, isCorrect: question.answer.includes('f') })
        if (question.g) answers.push({ content: question.g, isCorrect: question.answer.includes('g') })
        if (question.h) answers.push({ content: question.h, isCorrect: question.answer.includes('h') })
        if (question.i) answers.push({ content: question.i, isCorrect: question.answer.includes('i') })
        if (question.j) answers.push({ content: question.j, isCorrect: question.answer.includes('j') })
        if (question.k) answers.push({ content: question.k, isCorrect: question.answer.includes('k') })
        if (question.l) answers.push({ content: question.l, isCorrect: question.answer.includes('l') })
        if (question.m) answers.push({ content: question.m, isCorrect: question.answer.includes('m') })
        if (question.n) answers.push({ content: question.n, isCorrect: question.answer.includes('n') })
        if (question.o) answers.push({ content: question.o, isCorrect: question.answer.includes('o') })
        if (question.p) answers.push({ content: question.p, isCorrect: question.answer.includes('p') })
        return {
          id: question.id,
          answers,
          type: question.type,
          instruction: question.instruction,
          content: question.content,
          a: question.a,
          b: question.b,
          c: question.c,
          d: question.d,
          e: question.e,
          f: question.f,
          g: question.g,
          h: question.h,
          i: question.i,
          j: question.j,
          k: question.k,
          l: question.l,
          m: question.m,
          n: question.n,
          o: question.o,
          p: question.p,
          answer: question.answer,
          explanation: question.explanation,
          category: question.category
        }
      })

      setQuestions(formattedQuestions)
      // if (selectedQuestionId !== null) {
      //   const updatedQuestion = formattedQuestions.find(
      //     (question: any) => question.id === selectedQuestionId
      //   ) || null
      //   setSelectedQuestion(updatedQuestion)
      // }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setListLoading(false)
    }
  }

  /**
   * Fetches the exam details.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const fetchExamDetail = async () => {
    if (!examId) return
    try {
      const response = await getExamById(examId)
      setExamDetail(response.data)
    } catch (error: any) {
      console.error('Error fetching exam details:', error)
    }
  }

  /**
   * Handles the question select event.
   *
   * @author Hien
   * @param {number} questionId - The ID of the selected question.
   */
  const handleQuestionSelect = (questionId: number) => {
    setLoading(true)
    const selected = questions.find(question => question.id === questionId)
    if (selected) {
      setSelectedQuestion(selected)
      setSelectedQuestionId(questionId)
      setIsAddingQuestion(false)
    }
    setLoading(false)
    setActiveMode('')
  }

  /**
   * Handles the add question click event.
   *
   * @author Hien
   */
  const handleAddQuestionClick = () => {
    setLoading(true)
    setSelectedQuestion(null)
    setSelectedQuestionId(null)
    setIsAddingQuestion(true)
    setActiveMode('adding')
    setLoading(false)
  }

  /**
   * Handles the icon delete click event.
   *
   * @author Hien
   * @param {Question} question - The question to delete.
   */
  const handleIconDeleteClick = (question: Question) => {
    setQuestionToDelete(question)
    setOpenDeleteModal(true)
  }

  /**
   * Confirms the deletion of a question.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const confirmDeleteQuestion = async () => {
    if (!examId) {
      toast.error(t('exam_admin.compose_question.toast.failed_delete_question'))
      return
    }
    if (questionToDelete) {
      try {
        await removeQuestionFromExam(examId, questionToDelete.id.toString())
        toast.success(t('exam_admin.compose_question.toast.success_delete_question'))
        setQuestions((prevQuestions) =>
          prevQuestions.filter((q) => q.id !== questionToDelete.id)
        )
        if (selectedQuestionId === questionToDelete.id) {
          setSelectedQuestion(null)
          setSelectedQuestionId(null)
          setIsAddingQuestion(true)
        }
      } catch (error: any) {
        toast.error(t('exam_admin.compose_question.toast.failed_delete_question'))
      }
    }
    setOpenDeleteModal(false)
    setQuestionToDelete(null)
  }

  // TODO: Fetch the exam details and questions on mount
  useEffect(() => {
    fetchQuestions()
    fetchExamDetail()
  }, [examId, pagination.pageIndex, pagination.pageSize, refreshCounter])

  /**
     * Handles the copy question action.
     *
     * @author Hien
     * @async
     * @param {Question} question - The question to copy.
     * @returns {Promise<void>}
     */
  const handleCopyQuestion = async (question: Question) => {
    try {
      const response = await createQuestion({
        examId,
        content: question.content,
        instruction: question.instruction,
        type: question.type,
        a: question.a,
        b: question.b,
        c: question.c,
        d: question.d,
        e: question.e,
        f: question.f,
        g: question.g,
        h: question.h,
        i: question.i,
        j: question.j,
        k: question.k,
        l: question.l,
        m: question.m,
        n: question.n,
        o: question.o,
        p: question.p,
        answer: question.answer,
        explanation: question.explanation,
        category: question.category
      })
      const newQuestion = response.data
      setHighlightedQuestionId(newQuestion.id)

      // Calculate new pagination values
      const newTotalItems = pagination.totalItems + 1
      const newTotalPages = Math.ceil(newTotalItems / pagination.pageSize)

      // Always navigate to the new last page
      setPagination(prev => ({
        ...prev,
        pageIndex: newTotalPages - 1,
        totalItems: newTotalItems,
        totalPages: newTotalPages
      }))

      // Always increment the refreshCounter to trigger a data refresh
      setRefreshCounter(prev => prev + 1)

      setTimeout(() => {
        setHighlightedQuestionId(null)
      }, 3000)
    } catch (error) {
      toast.error(t('question_bank_admin.toast.copy_question_failed'))
    }
  }
  useEffect(() => {
    if (!listLoading && highlightedQuestionId && questionsContainerRef?.current) {
      requestAnimationFrame(() => {
        const container = questionsContainerRef.current
        if (container) {
          container.scrollTop = container.scrollHeight
        }
      })
    }
  }, [listLoading, highlightedQuestionId])

  // TODO: Initialize state for the show add text question modal flag
  const [showAddTextQuestionModal, setShowAddTextQuestionModal] = useState(false)

  /**
   * Handles the question modal button click event.
   *
   * @author Hien
   */
  const handleQuestionModalButtonClick = () => {
    setShowAddTextQuestionModal(true)
    setActiveMode('text')
  }

  /**
   * Handles the close add text question modal event.
   *
   * @author Hien
   */
  const handleCloseAddTextQuestionModal = () => {
    setShowAddTextQuestionModal(false)
    selectedQuestion ? setActiveMode('') : setActiveMode('adding')
  }

  /**
   * Handles the sort question click event.
   *
   * @author Hien
   */
  const handleSortQuestionClick = () => {
    setShowSortModal(true)
    setActiveMode('sorting')
  }

  /**
   * Handles the close sort modal event.
   *
   * @author Hien
   */
  const handleCloseSortModal = () => {
    setShowSortModal(false)
    selectedQuestion ? setActiveMode('') : setActiveMode('adding')
  }

  // // Save the question order and update the state
  // const handleSaveQuestionOrder = (newOrder: Question[]) => {
  //   setQuestions(newOrder)
  //   setShowSortModal(false)
  // }

  // Modal: Question bank (DualTableDrag)
  /**
   * Handles the dual table click event.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleDualTableClick = async () => {
    setActiveMode('dualtable')
    setShowDualTableModal(true)
  }

  /**
   * Handles the close dual table modal event.
   *
   * @author Hien
   */
  const handleCloseDualTableModal = () => {
    setShowDualTableModal(false)
    selectedQuestion ? setActiveMode('') : setActiveMode('adding')
  }

  // TODO: Update the active mode when the questions array is empty
  useEffect(() => {
    if (questions.length === 0) {
      setActiveMode('adding')
    }
  }, [questions])

  return (
    <div className="flex">
      {/* Left Panel */}
      <div className="w-5/12 bg-gray-100 p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{t('exam_admin.compose_question.exam')}</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {/* Add Question Button */}
          <button
            className={`hover:bg-gray-200 text-green-500 font-bold py-1 px-3 rounded border border-green-500 ${activeMode === 'adding' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-white'}`}
            onClick={handleAddQuestionClick}
          >
            {t('exam_admin.compose_question.add_question')}
          </button>
          {/* Add By Text Button */}
          <button className={`hover:bg-gray-200 text-green-500 font-bold py-1 px-3 rounded border border-green-500 ${activeMode === 'text' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-white'}`} onClick={handleQuestionModalButtonClick}>
            {t('exam_admin.compose_question.add_by_text')}
          </button>
          {/* Sort Question Button */}
          <button
            className={`hover:bg-gray-200 text-green-500 font-bold py-1 px-3 rounded border border-green-500 ${activeMode === 'sorting' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-white'}`}
            onClick={handleSortQuestionClick}
          >
            {t('exam_admin.compose_question.sort_question')}
          </button>
          {/* Add From Bank Button */}
          <button
            className={`hover:bg-gray-200 text-green-500 font-bold py-1 px-3 rounded border border-green-500 ${activeMode === 'dualtable'
              ? 'bg-green-500 hover:bg-green-600 text-white border-transparent'
              : 'bg-white'
              }`}
            onClick={handleDualTableClick}
          >
            {t('exam_admin.compose_question.add_from_bank')}
          </button>
        </div>
        <div className="mb-4 bg-black">
          <hr className="border-1 border-gray-400" />
        </div>
        {/* If no questions are found, display a message */}
        <div className='mt-2'>
          {listLoading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <ClipLoader color="#5EEAD4" loading={listLoading} size={40} />
            </div>
          ) : questions.length === 0 ? (
                <p className="text-red-500 font-medium text-center">{t('exam_admin.compose_question.no_question_found')}</p>
          ) : (
            <div className="overflow-y-auto h-[60vh]" ref={questionsContainerRef}>
              {questions.map((question, index) => (
                <ExamQuestionItem
                  key={question.id}
                  question={question}
                  index={pagination.pageIndex * pagination.pageSize + index}
                  isSelected={selectedQuestionId === question.id}
                  onSelect={handleQuestionSelect}
                  onDelete={handleIconDeleteClick}
                  handleCopyQuestion={handleCopyQuestion}
                  highlighted={question.id === highlightedQuestionId}
                />
              ))}
            </div>
          )}
      </div>
       <div className="mt-4 flex justify-center">
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
         />
       </div>
       </div>
      {/* Right Panel */}
      <div className="w-7/12 p-4">
        {loading
          ? <div className="flex justify-center items-center h-full">
            <ClipLoader color="#5EEAD4" loading={loading} size={40} />
          </div>
          : (isAddingQuestion
              ? <AddQuestionForm examId={examId ?? 0} fetchQuestions={fetchQuestions} examDetail={examDetail} />
              : <EditQuestionForm examId={examId ?? 0} selectedQuestion={selectedQuestion} fetchQuestions={fetchQuestions} setUpdatedQuestion={(updatedQuestion: Question) => {
                setSelectedQuestion(updatedQuestion)
                setSelectedQuestionId(updatedQuestion.id)
              }} />)}
      </div>

      {/* Modal add text question */}
      {showAddTextQuestionModal && (
        <AddTextQuestionModal onClose={handleCloseAddTextQuestionModal} examId={examId} onSuccess={fetchQuestions} examDetail={examDetail} />
      )}

      <ModalComponent
        isOpen={openDeleteModal}
        title={`${t('exam_admin.compose_question.confirm_delete')}`}
        description={`${t('exam_admin.compose_question.confirm_delete_message')}`}
        onClose={() => setOpenDeleteModal(false)}
        onOk={confirmDeleteQuestion}
        onCancel={() => setOpenDeleteModal(false)}
        cancelText={`${t('exam_admin.compose_question.cancel')}`}
        okText={`${t('exam_admin.compose_question.delete')}`}
      />

      {/* Sort Question Modal */}
      {showSortModal && (
        <SortQuestionModal
          onClose={handleCloseSortModal}
          onSuccess={fetchQuestions}
          examId={examId!}
        />
      )}

      {showDualTableModal && (
        <DualTableDragModal
          onClose={handleCloseDualTableModal}
          onSuccess={fetchQuestions}
          examId={examId!}
          examDetail={examDetail}
        />
      )}
    </div>
  )
}

export default ComposeQuestion
