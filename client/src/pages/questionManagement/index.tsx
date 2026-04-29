/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
import React, { useState, useEffect } from 'react'
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Tooltip, Checkbox, IconButton, Box } from '@mui/material'
import ModalComponent from '../../components/Modal'
import AddQuestionForm from './components/AddQuestionForm'
import EditQuestionForm from './components/EditQuestionForm'
import { getQuestionsByCategory, removeQuestion, createQuestion, removeMultipleQuestions } from 'api/post/post.api'
import { toast } from 'react-toastify'
import { ClipLoader } from 'react-spinners'
import { Question } from '../../api/post/post.interface'
import Select, { SingleValue } from 'react-select'
import Pagination from '@mui/material/Pagination'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import EditIcon from '@mui/icons-material/Edit'
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone'
import { useTranslation } from 'services/i18n'
import ContentCopyRoundedIcon from '@mui/icons-material/ContentCopyRounded'
import AddTextQuestionModal from '../examManagement/components/AddTextQuestionModal'
import MoreVertIcon from '@mui/icons-material/MoreVert'
import ClickAwayListener from '@mui/material/ClickAwayListener'

import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import QuillShow from '../../components/QuillEditor'

const SearchBar = ({ onSearch }: { onSearch: (term: string) => void }) => {
  const { t, i18n } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')

  const handleClear = () => {
    setSearchTerm('')
    onSearch('')
  }

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value)
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '320px' }}>
      <TextField
        label={`${t('question_bank_admin.searchLable')}`}
        // placeholder={`${t('question_bank_admin.search')}`}
        variant="outlined"
        size="small"
        value={searchTerm}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {/* <SearchIcon fontSize="small" /> */}
            </InputAdornment>
          ),
          endAdornment: searchTerm ? (
            <InputAdornment position="end">
              <IconButton
                onClick={handleClear}
                edge="end"
                size="small"
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null
        }}
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: '4px' } }}
      />
      <Button
        size="small"
        onClick={handleSearch}
        sx={{
          ml: 0.5,
          textTransform: 'none',
          height: '40px',
          minWidth: '40px'
        }}
        color="primary"
        variant="contained"
      >
        <SearchIcon fontSize="small" />
      </Button>
    </Box>
  )
}

type FilterOption = 'COURSE' | 'GROUP'

interface OptionType {
  value: FilterOption
  label: string
}

const options: OptionType[] = [
  { value: 'COURSE', label: 'Câu hỏi khóa học' },
  { value: 'GROUP', label: 'Câu hỏi nghiệp vụ' }
]

const questionTypeOptions = [
  { value: 'SINGLE_CHOICE', label: 'Một đáp án' },
  { value: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' }
]

const examUsageOptions = [
  { value: 'USED', label: 'Đã sử dụng' },
  { value: 'NOT_USED', label: 'Chưa sử dụng' }
]

const removeImagesFromHtml = (html: string): string => {
  return html.replace(/<img[^>]*>/gi, '')
}

/**
 * Custom styles for react-select
 *
 * @author Hien
 * @param {boolean} isError
 * @returns {object}
 */
const customStyles = (isError: boolean) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: isError ? 'red' : state.isFocused ? 'rgb(34,197,94)' : provided.borderColor,
    boxShadow: isError
      ? '0 0 0 1px red'
      : state.isFocused
        ? '0 0 0 1px rgb(34,197,94)'
        : provided.boxShadow,
    '&:hover': {
      borderColor: isError ? 'red' : state.isFocused ? 'rgb(34,197,94)' : provided['&:hover'].borderColor
    }
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? 'rgb(34,197,94)' : provided.backgroundColor && state.isFocused ? 'rgb(196, 246, 215)' : provided.backgroundColor,
    color: state.isSelected ? 'white' : provided.color && state.isFocused ? 'black' : provided.color,
    cursor: 'pointer',
    ':active': {
      ...provided[':active'],
      backgroundColor: 'rgb(170, 222, 189)'
    }
  })
})

/**
 * QuestionItem component for rendering a single question item.
 *
 * @author Hien
 * @param {object} props - The properties passed to the component.
 */
const QuestionItem = ({
  question,
  index,
  isSelected,
  onSelect,
  onDelete,
  handleCopyQuestion,
  highlighted,
  isChecked,
  onCheckboxChange
}: {
  question: Question
  index: number
  isSelected: boolean
  onSelect: (id: number) => void
  onDelete: (question: Question) => void
  handleCopyQuestion: (question: Question) => void
  highlighted: boolean
  isChecked: boolean
  onCheckboxChange: (id: number, checked: boolean) => void
}) => {
  const { t } = useTranslation()
  // TODO: Initialize state for showing/hiding question details
  const [showDetails, setShowDetails] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  /**
   * Renders the question content based on whether details are shown or not.
   *
   * @author Hien
   * @returns {JSX.Element} The rendered question content.
   */
  const renderContent = () =>
    showDetails
      ? <QuillShow htmlContent={question?.content} />
      : <QuillShow htmlContent={removeImagesFromHtml(question?.content)} />

  return (
    <div className={`relative ${isChecked ? 'bg-[rgb(209,228,246)]' : 'bg-gray-50'} border-2 rounded-md flex mb-2 
      ${isSelected ? 'bg-green-500' : 'border-gray-200'} 
      ${question.Exams && question.Exams.length > 0 ? 'pt-6 pl-3 pr-3 pb-3' : 'p-3'}
      ${highlighted ? 'animate-fade-right' : ''}`}>
      <div className="flex items-center">
      <Checkbox
        checked={isChecked}
        onChange={(e) => !(question.Exams && question.Exams.length > 0) && onCheckboxChange(question.id, e.target.checked)}
        size="small"
        color="primary"
        disabled={question.Exams && question.Exams.length > 0}
        sx={{
          '&.Mui-disabled': {
            color: 'rgba(0, 0, 0, 0.26)'
          }
        }}
        className={`${isSelected ? 'hover:bg-gray-100' : ''} `}
      />
      </div>
      {question.Exams && question.Exams.length > 0 && (
        <div className="absolute top-0 left-2 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap cursor-help pt-3">
          <Tooltip
            title={
              <div>
                {question.Exams.map((exam, index) => (
                  <div key={index}>{`"${exam.name}"`}</div>
                ))}
              </div>
            }
          >
            <span className="italic text-gray-500 text-xs">
              {t('question_bank_admin.used_in_exam')}
              {question.Exams.map(exam => `"${exam.name}"`).join(', ').length > 30
                ? question.Exams.map(exam => `"${exam.name}"`).join(', ').slice(0, 30) + '...'
                : question.Exams.map(exam => `"${exam.name}"`).join(', ')}
            </span>
          </Tooltip>
        </div>
      )}
      <div className={`flex-1 ml-3 ${question.Exams && question.Exams.length > 0 ? 'mt-3' : 'mt-0'}`}>
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
                        className="flex items-center justify-center w-8 h-8 text-blue-500 hover:bg-gray-100 rounded-full"
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
                        className="flex items-center justify-center w-8 h-8 text-blue-500 hover:bg-gray-100 rounded-full"
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
                        className="flex items-center justify-center w-8 h-8 text-red-500 hover:bg-gray-100 rounded-full"
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
                    className="flex items-center justify-center w-8 h-8 text-gray-600 hover:bg-gray-200 rounded-full"
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
                          <QuillShow htmlContent={ans?.content} />
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <strong>{t('question_bank_admin.explanation')}:</strong>{' '}
                   <QuillShow htmlContent={question?.explanation} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * QuestionManagementPage component for managing questions.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered QuestionManagementPage component.
 */
const QuestionManagementPage = () => {
  const { t } = useTranslation()
  // TODO: Initialize state for questions
  const [questions, setQuestions] = useState<Question[]>([])
  // TODO: Initialize state for selected question
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  // TODO: Initialize state for adding question mode
  const [isAddingQuestion, setIsAddingQuestion] = useState(true)
  // TODO: Initialize state for selected question id
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(null)
  // TODO: Initialize state for delete modal
  const [openDeleteModal, setOpenDeleteModal] = useState(false)
  // TODO: Initialize state for question to delete
  const [questionToDelete, setQuestionToDelete] = useState<Question | null>(null)
  // TODO: Initialize state for loading indicator
  const [loading, setLoading] = useState(false)
  // TODO: Initialize state for list loading indicator
  const [listLoading, setListLoading] = useState(false)
  // TODO: Initialize state for active mode
  const [activeMode, setActiveMode] = useState<'adding' | 'text' | ''>('adding')
  // TODO: Initialize state for filter option
  const [filterOption, setFilterOption] = useState('')
  // TODO: Initialize state for question type filter
  const [questionTypeFilter, setQuestionTypeFilter] = useState('')
  // TODO: Initialize state for exam usage filter
  const [examUsageFilter, setExamUsageFilter] = useState('')
  // TODO: Initialize state for clearable select
  const [isClearable, setIsClearable] = useState(true)
  // TODO: Initialize state for showing/hiding filter
  const [showFilter, setShowFilter] = useState(false)
  // TODO: Initialize state for temporary filter option
  const [tempFilterOption, setTempFilterOption] = useState('')
  // TODO: Initialize state for temporary question type filter
  const [tempQuestionTypeFilter, setTempQuestionTypeFilter] = useState('')
  // TODO: Initialize state for temporary exam usage filter
  const [tempExamUsageFilter, setTempExamUsageFilter] = useState('')
  // TODO: Initialize state for highlighted question id
  const [highlightedQuestionId, setHighlightedQuestionId] = useState<number | null>(null)
  // TODO: Use useRef to reference the questions container
  const questionsContainerRef = React.useRef<HTMLDivElement>(null)
  // TODO: Initialize state for refresh counter
  const [refreshCounter, setRefreshCounter] = useState(0)
  const [selectedQuestions, setSelectedQuestions] = useState<number[]>([])
  const [showAddTextQuestionModal, setShowAddTextQuestionModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // TODO: Initialize state for pagination
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })
  // TODO: Initialize state for showing/hiding edit modal
  const [showEditModal, setShowEditModal] = useState(false)
  // TODO: Initialize state for question pending edit
  const [questionPendingEdit, setQuestionPendingEdit] = useState<Question | null>(null)
  // TODO: Initialize state for add form key
  const [addFormKey, setAddFormKey] = useState(0)

  /**
   * Fetches questions based on the selected category.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const fetchQuestions = async () => {
    setListLoading(true)
    try {
      // TODO: Get questions by category
      const response = await getQuestionsByCategory({
        filterOption: filterOption ?? '',
        questionTypeFilter: questionTypeFilter ?? '',
        examUsageFilter: examUsageFilter ?? '',
        search: searchTerm ?? '',
        start: pagination.pageIndex * pagination.pageSize,
        size: pagination.pageSize
      })

      const apiData = response.data.data
      const totalItems = response.data.meta?.total || apiData.length
      const totalPages = Math.ceil(totalItems / pagination.pageSize)

      // TODO: Set the pagination state
      setPagination(prev => ({
        ...prev,
        totalItems,
        totalPages
      }))

      // TODO: Format the questions
      const formattedQuestions = apiData.map((question: any) => {
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
          category: question.category,
          Exams: question.Exams || []
        }
      })

      setQuestions(formattedQuestions)
      // TODO: If a question is selected, update the selected question
      if (selectedQuestionId !== null) {
        const updatedQuestion = formattedQuestions.find(
          (question: any) => question.id === selectedQuestionId
        )
        if (updatedQuestion) {
          setSelectedQuestion(updatedQuestion)
        }
      }
    } catch (error) {
      console.error('Error fetching questions:', error)
    } finally {
      setListLoading(false)
    }
  }

  /**
   * Handles the selection of a question.
   *
   * @author Hien
   * @param {number} questionId - The id of the selected question.
   * @returns {void}
   */
  const handleQuestionSelect = (questionId: number) => {
    setLoading(true)
    const selected = questions.find(question => question.id === questionId)
    if (selected) {
      // TODO: If the question is used in an exam, show the edit modal
      if (selected.Exams && selected.Exams.length > 0) {
        setQuestionPendingEdit(selected)
        setShowEditModal(true)
      } else {
        setSelectedQuestion(selected)
        setSelectedQuestionId(questionId)
        setIsAddingQuestion(false)
      }
    }
    setLoading(false)
    setActiveMode('')
  }

  /**
   * Confirms the edit question action.
   *
   * @author Hien
   * @returns {void}
   */
  const confirmEditQuestion = () => {
    if (questionPendingEdit) {
      setSelectedQuestion(questionPendingEdit)
      setSelectedQuestionId(questionPendingEdit.id)
      setIsAddingQuestion(false)
      setShowEditModal(false)
      setQuestionPendingEdit(null)
    }
  }

  /**
   * Cancels the edit question action.
   *
   * @author Hien
   * @returns {void}
   */
  const cancelEditQuestion = () => {
    setShowEditModal(false)
    setQuestionPendingEdit(null)
  }

  /**
   * Handles the add question click event.
   *
   * @author Hien
   * @returns {void}
   */
  const handleAddQuestionClick = () => {
    // TODO: Set loading to true
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
   * @returns {void}
   */
  const handleIconDeleteClick = (question: Question) => {
    setQuestionToDelete(question)
    setOpenDeleteModal(true)
  }

  // TODO: Use useEffect to fetch questions when the filter options, pagination, or refresh counter change
  useEffect(() => {
    fetchQuestions()
  }, [filterOption, questionTypeFilter, examUsageFilter, pagination.pageIndex, pagination.pageSize, refreshCounter, searchTerm])

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
      if (pagination.pageIndex === 0) {
        setRefreshCounter(prev => prev + 1)
      } else {
        setPagination(prev => ({ ...prev, pageIndex: 0 }))
      }
      setTimeout(() => {
        setHighlightedQuestionId(null)
      }, 3000)
    } catch (error) {
      toast.error(t('question_bank_admin.toast.copy_question_failed'))
    }
  }
  useEffect(() => {
    if (highlightedQuestionId && questionsContainerRef?.current) {
      questionsContainerRef.current.scrollTop = 0
    }
  }, [highlightedQuestionId])

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

  const handleCheckboxChange = (questionId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedQuestions(prev => [...prev, questionId])
    } else {
      setSelectedQuestions(prev => prev.filter(id => id !== questionId))
    }
  }

  const handleBulkDelete = () => {
    if (selectedQuestions.length > 0) {
      const questionsToDelete = questions.filter(q => selectedQuestions.includes(q.id))
      setQuestionToDelete(questionsToDelete[0])
      setOpenDeleteModal(true)
    } else {
      toast.error(t('question_bank_admin.toast.no_question_selected'))
    }
  }

  const confirmDeleteQuestion = async () => {
    if (selectedQuestions.length > 1) {
      try {
        await removeMultipleQuestions(selectedQuestions)
        toast.success(t('question_bank_admin.toast.bulk_delete_success'))
        setQuestions(prev => prev.filter(question => !selectedQuestions.includes(question.id)))
        setSelectedQuestions([])
        if (selectedQuestionId !== null && selectedQuestions.includes(selectedQuestionId)) {
          setSelectedQuestion(null)
          setSelectedQuestionId(null)
          setIsAddingQuestion(true)
        }
      } catch (error: any) {
        toast.error(t('question_bank_admin.toast.bulk_delete_failed'))
      }
    } else if (questionToDelete) {
      try {
        await removeQuestion(questionToDelete.id.toString())
        toast.success(t('question_bank_admin.toast.delete_success'))
        setQuestions((prev) => prev.filter((question) => question.id !== questionToDelete.id))
        setSelectedQuestions(prev => prev.filter(id => id !== questionToDelete.id))

        if (selectedQuestionId === questionToDelete.id) {
          setSelectedQuestion(null)
          setSelectedQuestionId(null)
          setIsAddingQuestion(true)
        }
      } catch (error: any) {
        if (error.message === 'Cannot delete question because it is referenced in other records.') {
          toast.error(t('question_bank_admin.toast.delete_used_question_failed'))
        } else {
          toast.error(t('question_bank_admin.toast.delete_failed'))
        }
      }
    }
    setOpenDeleteModal(false)
    setQuestionToDelete(null)
  }

  const handleSearch = (term: string) => {
    setSearchTerm(term)
    setPagination(prev => ({ ...prev, pageIndex: 0 }))
  }
  return (
    <div className="flex">
      {/* Left Panel */}
      <div className="w-5/12 bg-gray-100 p-4 border-r overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">{t('question_bank_admin.title')}</h2>
        <div className="grid grid-cols-2 gap-2 mb-4">
          <button
            className={`hover:bg-gray-200 text-green-500 font-bold py-1 px-3 rounded border border-green-500 ${activeMode === 'adding' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-white'}`}
            onClick={handleAddQuestionClick}
          >
            {t('question_bank_admin.add_question')}
          </button>
          {/* Add By Text Button */}
          <button className={`hover:bg-gray-200 text-green-500 font-bold py-1 px-3 rounded border border-green-500 ${activeMode === 'text' ? 'bg-green-500 hover:bg-green-600 text-white border-transparent' : 'bg-white'}`} onClick={handleQuestionModalButtonClick}>
            {t('exam_admin.compose_question.add_by_text')}
          </button>
        </div>
        <div className="mb-4 bg-black">
          <hr className="border-1 border-gray-400" />
        </div>
        <div className="flex justify-between items-center relative mb-2">
          <div className="flex items-center space-x-2">
            <button
              className="hover:bg-gray-200 text-green-500 font-bold py-0.5 px-2 rounded border border-green-500 bg-white"
              onClick={() => {
                setTempFilterOption(filterOption)
                setTempQuestionTypeFilter(questionTypeFilter)
                setTempExamUsageFilter(examUsageFilter)
                setShowFilter(prev => !prev)
              }}
            >
              {t('question_bank_admin.filter')}
              <FilterAltTwoToneIcon className="ml-1" />
            </button>
            {/* Delete button */}
            <Tooltip title={t('exam_admin.exam_delete_selected')}>
              <span>
              <button
                className="btn bg-red-500 hover:bg-red-400 p-1.5 rounded-sm"
                onClick={handleBulkDelete}
                // disabled={selectedQuestions.length === 0}
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                </svg>
              </button>
              </span>
            </Tooltip>
          </div>
          {/* Right side - Search Bar */}
          <div>
              <SearchBar onSearch={handleSearch} />
          </div>
        </div>
        <div className="ml-2 flex flex-wrap">
          {questionTypeFilter && (
            <div className="flex items-center bg-green-100 text-green-700 px-2 py-1 rounded">
              {t(`question_bank_admin.${questionTypeOptions.find((opt) => opt.value === questionTypeFilter)?.value === 'SINGLE_CHOICE' ? 'single_choice' : 'multiple_choice'}`)}
              <button
                onClick={() => {
                  setQuestionTypeFilter('')
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
                className="ml-1 text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
            </div>
          )}
          {filterOption && (
            <div className="ml-2 flex items-center bg-green-100 text-green-700 px-2 py-1 rounded mr-2">
              {t(`question_bank_admin.${options.find((opt) => opt.value === filterOption)?.value === 'COURSE' ? 'for_course' : 'for_group'}`)}
              <button
                onClick={() => {
                  setFilterOption('')
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
                className="ml-1 text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
            </div>
          )}
          {examUsageFilter && (
            <div className="ml-2 flex items-center bg-green-100 text-green-700 px-2 py-1 rounded">
              {t(`question_bank_admin.${examUsageOptions.find((opt) => opt.value === examUsageFilter)?.value === 'USED' ? 'used' : 'not_used'}`)}
              <button
                onClick={() => {
                  setExamUsageFilter('')
                  setPagination(prev => ({ ...prev, pageIndex: 0 }))
                }}
                className="ml-1 text-red-500"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-3 w-3"
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
            </div>
          )}
        </div>
        {showFilter && (
          <div className="absolute z-10 bg-white border border-gray-300 shadow-lg p-4 w-120">
            <div className="mb-4 flex items-center">
              <label className="w-40 mb-2">{t('question_bank_admin.question_type')}:</label>
              <Select
                options={questionTypeOptions}
                value={
                  questionTypeOptions.find((opt) => opt.value === tempQuestionTypeFilter) || null
                }
                onChange={(selectedOption) => {
                  setTempQuestionTypeFilter(selectedOption?.value ?? '')
                }}
                isClearable={isClearable}
                styles={customStyles(false)}
                className="flex-1"
                placeholder={t('question_bank_admin.question_type')}
                formatOptionLabel={(option) => t(`question_bank_admin.${option.value === 'SINGLE_CHOICE' ? 'single_choice' : 'multiple_choice'}`)}
              />
            </div>
            <div className="mb-4 flex items-center">
              <label className="w-40 mb-2">{t('question_bank_admin.question_category')}:</label>
              <Select
                options={options}
                value={options.find((opt) => opt.value === tempFilterOption) || null}
                onChange={(selectedOption: SingleValue<OptionType>) => {
                  setTempFilterOption(selectedOption?.value ?? '')
                }}
                isClearable={isClearable}
                styles={customStyles(false)}
                className="flex-1"
                placeholder={t('question_bank_admin.question_category')}
                formatOptionLabel={(option) => t(`question_bank_admin.${option.value === 'COURSE' ? 'for_course' : 'for_group'}`)}
              />
            </div>
            <div className="mb-4 flex items-center">
              <label className="w-40 mb-2">{t('question_bank_admin.exam_usage_status')}:</label>
              <Select
                options={examUsageOptions}
                value={
                  examUsageOptions.find((opt) => opt.value === tempExamUsageFilter) || null
                }
                onChange={(selectedOption) => {
                  setTempExamUsageFilter(selectedOption?.value ?? '')
                }}
                isClearable={isClearable}
                styles={customStyles(false)}
                className="flex-1"
                placeholder={t('question_bank_admin.exam_usage_status')}
                formatOptionLabel={(option) => t(`question_bank_admin.${option.value === 'USED' ? 'used' : 'not_used'}`)}
              />
            </div>
            <button
              className="mt-2 px-3 py-1 rounded bg-green-500 text-white font-bold hover:bg-green-600"
              onClick={() => {
                setFilterOption(tempFilterOption)
                setQuestionTypeFilter(tempQuestionTypeFilter)
                setExamUsageFilter(tempExamUsageFilter)
                setPagination(prev => ({ ...prev, pageIndex: 0 }))
                setShowFilter(false)
              }}
            >
              {t('question_bank_admin.apply')}
            </button>
          </div>
        )}
        <div className="mt-2">
          {selectedQuestions.length > 0 && !questionTypeFilter && !filterOption && !examUsageFilter && !searchTerm && (
            <div className="flex items-center w-full bg-[rgb(229,246,253)] p-2 ">
              <span>{selectedQuestions.length}{t('question_bank_admin.selected_type')}{pagination.totalItems} {t('question_bank_admin.selected_questions')}</span>
              <Button
                color="primary"
                variant="text"
                size="small"
                onClick={() => {
                  setSelectedQuestions([])
                }}
                sx={{ ml: 1, p: 0 }}
              >
                {t('question_bank_admin.clear_selection')}
              </Button>
            </div>
          )}
        </div>
        <div className='mt-2'>
          {/* Nếu không có câu hỏi */}
          {listLoading ? (
            <div className="flex justify-center items-center h-[60vh]">
              <ClipLoader color="#5EEAD4" loading={listLoading} size={40} />
            </div>
          ) : questions.length === 0 ? (
            <p className="flex h-full items-center justify-center text-gray-500">{t('question_bank_admin.no_questions_found')}</p>
          ) : (
            <div className="overflow-y-auto h-[60vh]" ref={questionsContainerRef}>
              {questions.map((question, index) => (
                <QuestionItem
                  key={question.id}
                  question={question}
                  index={pagination.pageIndex * pagination.pageSize + index}
                  isSelected={selectedQuestionId === question.id}
                  onSelect={handleQuestionSelect}
                  onDelete={handleIconDeleteClick}
                  handleCopyQuestion={handleCopyQuestion}
                  highlighted={question.id === highlightedQuestionId}
                  isChecked={selectedQuestions.includes(question.id)}
                  onCheckboxChange={handleCheckboxChange}
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
      {/* <div className="w-7/12 p-4">
        {loading
          ? <div className="flex justify-center items-center h-full">
            <ClipLoader color="#5EEAD4" loading={loading} size={40} />
          </div>
          : (isAddingQuestion
              ? <AddQuestionForm setIsAddingQuestion={setIsAddingQuestion} fetchQuestions={fetchQuestions} copiedQuestion={selectedQuestion} key={addFormKey}/>
              : <EditQuestionForm selectedQuestion={selectedQuestion} fetchQuestions={fetchQuestions} />)}
      </div> */}
      <div className="w-7/12 p-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <ClipLoader color="#5EEAD4" loading={loading} size={40} />
          </div>
        ) : showEditModal ? null : (
          isAddingQuestion
            ? <AddQuestionForm fetchQuestions={fetchQuestions} key={addFormKey} />
            : <EditQuestionForm selectedQuestion={selectedQuestion} fetchQuestions={fetchQuestions} />
        )}
      </div>
      {/* Modal add text question */}
      {showAddTextQuestionModal && (
        <AddTextQuestionModal onClose={handleCloseAddTextQuestionModal} onSuccess={fetchQuestions} />
      )}
      {/* Modal xác nhận xóa */}
      <ModalComponent
        isOpen={openDeleteModal}
        title={`${t('question_bank_admin.confirm_delete')}`}
        imageUrl='/assets/images/permission/delete.png'
        description={`${t(selectedQuestions.length > 1 ? 'question_bank_admin.confirm_bulk_delete_message' : 'question_bank_admin.confirm_delete_message',
          selectedQuestions.length > 1
            ? { count: selectedQuestions.length }
            : {}
        )}`}
        onClose={() => setOpenDeleteModal(false)}
        onOk={confirmDeleteQuestion}
        onCancel={() => setOpenDeleteModal(false)}
        cancelText={`${t('question_bank_admin.cancel')}`}
        okText={`${t('question_bank_admin.delete')}`}
      />
      {/* Modal xác nhận chỉnh sửa */}
      <ModalComponent
        isOpen={showEditModal}
        title={`${t('question_bank_admin.confirm_edit')}`}
        description={`${t('question_bank_admin.confirm_edit_message')}`}
        onClose={cancelEditQuestion}
        onOk={confirmEditQuestion}
        onCancel={cancelEditQuestion}
        cancelText={`${t('question_bank_admin.cancel')}`}
        okText={`${t('question_bank_admin.continue')}`}
      />
    </div>
  )
}

export default QuestionManagementPage
