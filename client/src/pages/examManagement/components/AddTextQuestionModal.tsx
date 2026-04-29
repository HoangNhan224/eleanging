/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
========================================================================== */
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import InstructionModal from './InstructionModal'
import { createBulkQuestions, fetchAllCourses, fetchAllGroups } from 'api/post/post.api'
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import { useTranslation } from 'react-i18next'
import { Checkbox } from '@mui/material'
import { useLocation } from 'react-router-dom'
import Select, { SingleValue, StylesConfig } from 'react-select'

interface AddTextQuestionModalProps {
  onClose: () => void
  onSuccess?: () => void
  examId?: number
  examDetail?: any
}

interface Question {
  id: number
  content: string
  answers: string[]
  correctAnswers: number[]
  type: 'MULTIPLE_CHOICE' | 'SINGLE_CHOICE'
}

interface QuestionParserProps {
  questionText: string
}

/**
 * QuestionParser component for parsing and displaying questions from text.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered QuestionParser component.
 */
const QuestionParser: React.FC<QuestionParserProps> = ({ questionText }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  /**
   * Parses the question text into an array of Question objects.
   *
   * @author Hien
   * @param {string} text - The question text to parse.
   * @returns {Question[]} An array of Question objects.
   */
  const parseQuestions = (text: string): Question[] => {
    const questions: Question[] = []
    // Split question blocks by two newlines
    const questionBlocks = text.split('\n\n').filter(block => block.trim() !== '')

    questionBlocks.forEach((block, index) => {
      const lines = block.split('\n').filter(line => line.trim() !== '')
      if (lines.length < 2) return // need at least 1 line for content and 1 line for answer

      // The first line is the question content
      const content = lines[0].trim()

      const answers: string[] = []
      const correctAnswers: number[] = []

      // Iterate through the answer lines
      const answerRegex = /^[*]?([A-Z])\.\s*(.*)$/
      lines.slice(1).forEach((line, idx) => {
        const trimmedLine = line.trim()
        const match = trimmedLine.match(answerRegex)
        if (match) {
          if (trimmedLine.startsWith('*')) {
            correctAnswers.push(idx)
          }
          answers.push(match[2].trim())
        }
      })

      // Determine the question type based on the number of correct answers
      const type = correctAnswers.length === 1 ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE'

      questions.push({
        id: index + 1,
        content,
        answers,
        correctAnswers,
        type
      })
    })

    return questions
  }
  // TODO: Parse the question text into an array of Question objects
  const parsedQuestions = parseQuestions(questionText)

  return (
    <div>
      {/* TODO: Check if there are any parsed questions */}
      {parsedQuestions.length > 0
        ? (
          <div>
            <h3 className="font-semibold mb-2">{t('exam_admin.add_text_question_modal.question_list')}</h3>
            <ul>
              {/* TODO: Map through the parsed questions and display them */}
              {parsedQuestions.map((question) => (
                  <li
                  key={question.id}
                  className={`mb-4 border p-2 rounded ${
                    (question.correctAnswers.length === 0 || question.answers.length > 16)
                      ? 'border-red-500 bg-red-100'
                      : 'border-gray-200'
                  }`}
                  >
                  <h4>
                    {t('exam_admin.add_text_question_modal.question')} {question.id} (
                    {/* TODO: Check if the question has any correct answers */}
                    {question.correctAnswers.length === 0
                      ? t('exam_admin.add_text_question_modal.not_defined')
                      : (question.type === 'SINGLE_CHOICE' ? t('exam_admin.add_text_question_modal.single_answer') : t('exam_admin.add_text_question_modal.multiple_answers'))}
                    )
                  </h4>
                  <p className='font-bold'>{question.content}</p>
                  <ul className="pl-4">
                    {/* TODO: Map through the answers and display them */}
                    {question.answers.map((answer, index) => (
                      <li key={index} className="flex items-center">
                        <div className="w-5 flex-shrink-0">
                          {question.correctAnswers.includes(index)
                            ? <span className="ml-2 text-green-500 font-bold">✔</span>
                            // : <CancelIcon style={{ color: 'red' }} fontSize="small" />
                            : <div className="w-5 h-5"></div>
                          }
                        </div>
                        <div className="flex items-center ml-2">
                          <span className="font-medium mr-1">{String.fromCharCode(65 + index)}. </span>
                          <span>{answer}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          )
        : (
          <div className="w-full h-[50vh] flex items-center justify-center">
            <img src='/assets/images/questions/question-icon.png' alt="icon_question" className='w-24 h-24'/>
          </div>
          )}
    </div>
  )
}

/**
 * AddTextQuestionModal component for adding questions from text.
 *
 * @author Khanh
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered AddTextQuestionModal component.
 */
const AddTextQuestionModal: React.FC<AddTextQuestionModalProps> = ({ onClose, examId, onSuccess, examDetail }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  const location = useLocation()
  const isQuestionManagement = location.pathname === '/question-bank'
  const [questionCategory, setQuestionCategory] = useState('')
  const [categoryError, setCategoryError] = useState(false)

  // Auto-detect category from exam detail for Exam Management
  const autoCategory = !isQuestionManagement && examDetail
    ? (examDetail.courseId ? 'COURSE' : examDetail.groupId ? 'GROUP' : null)
    : null
  // TODO: Initialize state for the question text
  const [questionText, setQuestionText] = useState('')
  // TODO: Initialize state for the show instruction flag
  const [showInstruction, setShowInstruction] = useState(false)
  // New state to fetch & choose course/group
  const [courses, setCourses] = useState<Array<{ id: string, name: string }>>([])
  const [groups, setGroups] = useState<Array<{ id: string, name: string }>>([])
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [coursesLoading, setCoursesLoading] = useState<boolean>(false)
  const [groupsLoading, setGroupsLoading] = useState<boolean>(false)
  const fetchCourses = async () => {
    if (!isQuestionManagement) return
    setCoursesLoading(true)
    try {
      const res = await fetchAllCourses()
      const coursesData = res.data?.data || res.data || []
      const formatted = coursesData.map((c: any) => ({
        id: c.id,
        name: c.name || c.courseName || 'Không rõ tên'
      }))
      setCourses(formatted)
    } catch (e) {
      console.error('Fetch courses error:', e)
    } finally {
      setCoursesLoading(false)
    }
  }

  const fetchGroups = async () => {
    if (!isQuestionManagement) return
    setGroupsLoading(true)
    try {
      const res = await fetchAllGroups()
      const groupsData = res.data?.data || res.data || []
      const formatted = groupsData.map((g: any) => ({
        id: g.id,
        name: g.name || g.groupName || 'Không rõ tên'
      }))
      setGroups(formatted)
    } catch (e) {
      console.error('Fetch groups error:', e)
    } finally {
      setGroupsLoading(false)
    }
  }

  /**
   * Handles the instruction button click event.
   *
   * @author Hien
   */
  const handleInstructionButtonClick = () => {
    // TODO: Set the show instruction flag to true
    setShowInstruction(true)
  }

  /**
   * Handles the instruction modal close event.
   *
   * @author Hien
   */
  const handleInstructionModalClose = () => {
    // TODO: Set the show instruction flag to false
    setShowInstruction(false)
  }

  /**
   * Handles the question text change event.
   *
   * @author Hien
   * @param {React.ChangeEvent<HTMLTextAreaElement>} e - The event object.
   */
  const handleQuestionTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuestionText(e.target.value)
  }

  // Function to parse the question text into an array of questions
  const parseQuestions = (text: string) => {
    const questions: Array<{
      content: string
      answers: string[]
      correctAnswers: number[]
      type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE'
    }> = []
    const questionBlocks = text.split('\n\n').filter(block => block.trim() !== '')
    questionBlocks.forEach((block) => {
      const lines = block.split('\n').filter(line => line.trim() !== '')
      if (lines.length < 2) return
      const content = lines[0].trim()
      const answers: string[] = []
      const correctAnswers: number[] = []
      const answerRegex = /^[*]?([A-Z])\.\s*(.*)$/
      lines.slice(1).forEach((line, idx) => {
        const trimmedLine = line.trim()
        const match = trimmedLine.match(answerRegex)
        if (match) {
          if (trimmedLine.startsWith('*')) {
            correctAnswers.push(idx)
          }
          answers.push(match[2].trim())
        }
      })
      const type = correctAnswers.length === 1 ? 'SINGLE_CHOICE' : 'MULTIPLE_CHOICE'
      questions.push({ content, answers, correctAnswers, type })
    })
    return questions
  }

  /**
   * Handles change of question category (course/group).
   *
   * @author Khanh
   * @param {string} category - The selected category.
   * @returns {void}
  */
  const handleCategoryChange = (category: string) => {
    if (questionCategory === category) {
      setQuestionCategory('')
      if (category === 'COURSE') setSelectedCourseId(null)
      if (category === 'GROUP') setSelectedGroupId(null)
      return
    }

    setQuestionCategory(category)
    if (categoryError) setCategoryError(false)
    if (category === 'COURSE') {
      setSelectedGroupId(null)
      if (courses.length === 0 && !coursesLoading) void fetchCourses()
    } else if (category === 'GROUP') {
      setSelectedCourseId(null)
      if (groups.length === 0 && !groupsLoading) void fetchGroups()
    }
  }
  /**
   * Handles the confirm add question event.
   *
   * @author Hien
   * @async
   */
  const handleConfirmAddQuestion = async () => {
    // TODO: Check if the question text is empty
    if (!questionText.trim()) {
      toast.error(t('exam_admin.add_text_question_modal.toast.question_content_required'))
      return
    }
    // TODO: Parse the question text into an array of Question objects
    const parsed = parseQuestions(questionText)
    if (parsed.length === 0) {
      toast.error(t('exam_admin.add_text_question_modal.toast.no_question_found'))
      return
    }

    // TODO: Check if any of the questions have more than 16 answers
    const invalidQuestion = parsed.find(q => q.answers.length > 16)
    if (invalidQuestion) {
      toast.error(t('exam_admin.add_text_question_modal.toast.each_question_max_16_answers'))
      return
    }
    if (!questionCategory && isQuestionManagement) {
      setCategoryError(true)
      toast.error(t('exam_admin.add_text_question_modal.toast.question_category_required'))
      return
    }
    // TODO: Check if course/group is selected when in Question Management
    if (isQuestionManagement && questionCategory === 'COURSE' && !selectedCourseId) {
      toast.error(t('exam_admin.add_text_question_modal.toast.please_select_a_course'))
      return
    }
    // TODO: Check if course/group is selected when in Question Management
    if (isQuestionManagement && questionCategory === 'GROUP' && !selectedGroupId) {
      toast.error(t('exam_admin.add_text_question_modal.toast.please_select_a_group'))
      return
    }
    // TODO: Map through the parsed questions and create an array of questions to send to the API
    const questionsToSend = parsed.map(q => {
      const answer =
        q.correctAnswers
          .map(idx => String.fromCharCode(97 + idx))
          .join(q.correctAnswers.length > 1 ? '::' : '')

      // TODO: For Question Bank: use selected course/group
      // TODO: For Exam Management: use courseId/groupId from examDetail
      let courseId, groupId
      if (isQuestionManagement) {
        courseId = questionCategory === 'COURSE' && selectedCourseId !== 'ALL' ? selectedCourseId : undefined
        groupId = questionCategory === 'GROUP' && selectedGroupId !== 'ALL' ? selectedGroupId : undefined
      } else if (examDetail) {
        // Auto-set from exam detail
        courseId = examDetail.courseId || undefined
        groupId = examDetail.groupId || undefined
      }

      return {
        ...q,
        answer,
        examId,
        courseId,
        groupId
      }
    })
    try {
      let response
      if (isQuestionManagement) {
        response = await createBulkQuestions(questionsToSend, questionCategory)
      } else {
        response = await createBulkQuestions(questionsToSend)
      }
      if (response.status === 200) {
        toast.success(t('exam_admin.add_text_question_modal.toast.success_add_question'))
        if (onSuccess) onSuccess()
        onClose()
      } else {
        toast.error(t('exam_admin.add_text_question_modal.toast.failed_add_question'))
      }
    } catch (error) {
      toast.error(t('exam_admin.add_text_question_modal.toast.failed_add_question'))
    }
  }
  // Custom styles for react-select
  function customStyles (arg0: boolean): StylesConfig<{ value: string | number, label: string }, false, import('react-select').GroupBase<{ value: string | number, label: string }>> | undefined {
    return {
      control: (provided, state) => ({
        ...provided,
        width: 370,
        display: 'flex',
        borderColor: state.isFocused ? 'rgb(34,197,94)' : provided.borderColor,
        boxShadow: state.isFocused ? '0 0 0 1px rgb(34,197,94)' : provided.boxShadow,
        '&:hover': {
          borderColor: state.isFocused ? 'rgb(34,197,94)' : provided.borderColor
        },
        overflow: 'hidden'
      }),
      valueContainer: (provided) => ({
        ...provided,
        height: 40,
        padding: '0 8px',
        display: 'flex',
        alignItems: 'center'
      }),
      input: (provided) => ({
        ...provided,
        margin: 0,
        padding: 0
      }),
      option: (provided, state) => ({
        ...provided,
        padding: '2px 5px',
        backgroundColor: state.isSelected
          ? 'rgb(34,197,94)'
          : state.isFocused
            ? 'rgb(196,246,215)'
            : 'white',
        color: state.isSelected ? 'white' : 'black',
        cursor: 'pointer',
        ':active': {
          ...provided[':active'],
          backgroundColor: 'rgb(170,222,189)'
        }
      }),
      singleValue: (provided) => ({
        ...provided,
        color: 'black',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '90%'
      }),
      menu: (provided) => ({
        ...provided,
        maxHeight: '150px'
      })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
    <div className="relative bg-white rounded-lg shadow-xl w-4/5 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div></div>
          <h2 className="text-2xl font-semibold text-gray-800">{t('exam_admin.add_text_question_modal.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main Content Area */}
        <div className="flex p-6 gap-4 h-[80vh]">
          {/* Left section */}
          <div className="w-1/2 flex flex-col gap-4">
          <div className='h-full'>
          <label className=" text-gray-700">{t('exam_admin.add_text_question_modal.compose_question')}</label>
            <textarea
              className="shadow-inner appearance-none border rounded-md w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm border-blue-400 h-full resize-none"
              placeholder={t('exam_admin.add_text_question_modal.please_compose_question') ?? ''}
              value={questionText}
              onChange={handleQuestionTextChange}
            />
          </div>
          </div>

          {/* Right Section - Preview Area */}
          <div className="w-1/2 flex flex-col justify-between">
            <div>
              <label className="text-gray-700">{t('exam_admin.add_text_question_modal.preview')}</label>
              <div className="bg-gray-50 rounded-md p-4 border border-blue-400 h-[60vh] overflow-auto">
                {/* TODO: Render the QuestionParser component */}
                <QuestionParser questionText={questionText} />
              </div>
            </div>
            {/* Auto category info for Exam Management */}
            {!isQuestionManagement && autoCategory && (
              <div className="pt-1">
                <div className="bg-blue-50 border border-blue-400 text-blue-700 px-4 py-3 rounded relative flex items-center">
                  <svg className="h-5 w-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <span className="block sm:inline">
                    {t('exam_admin.add_text_question_modal.auto_category_info')}:{' '}
                    <strong>
                      {autoCategory === 'COURSE'
                        ? t('exam_admin.add_text_question_modal.category_course')
                        : t('exam_admin.add_text_question_modal.category_group')
                      }
                    </strong>
                  </span>
                </div>
              </div>
            )}

            {isQuestionManagement && (
              <div className="p-4">
                <label className="font-semibold mb-2">{t('exam_admin.add_text_question_modal.question_category')}</label>
                <div className={`flex items-center space-x-4 p-2 rounded ${categoryError ? 'border border-red-500 bg-red-50' : ''}`}>
                  <label className="flex items-center">
                    <Checkbox
                      value="COURSE"
                      checked={questionCategory === 'COURSE'}
                      onChange={() => handleCategoryChange('COURSE')}
                    />
                    {t('exam_admin.add_question_form.for_course')}
                  </label>
                  <label className="flex items-center">
                    <Checkbox
                      value="GROUP"
                      checked={questionCategory === 'GROUP'}
                      onChange={() => handleCategoryChange('GROUP')}
                    />
                    {t('exam_admin.add_question_form.for_group')}
                  </label>
                </div>
                {questionCategory === 'COURSE' && (
                  <div className="mt">
                    <Select<{ value: string | number, label: string }, false>
                      styles={customStyles(false)}
                      menuPlacement="top"
                      options={[
                        { value: 'ALL', label: 'Tất cả' },
                        ...(coursesLoading
                          ? [{ value: '', label: t('exam_admin.add_text_question_modal.loading') ?? 'Đang tải...' }]
                          : courses.map(c => ({ value: String(c.id), label: c.name }))
                        )
                      ]}
                      value={
                        selectedCourseId
                          ? {
                              value: selectedCourseId,
                              label:
                              selectedCourseId === 'ALL'
                                ? 'Tất cả'
                                : courses.find(c => String(c.id) === String(selectedCourseId))?.name || ''
                            }
                          : null
                      }
                      onChange={(opt: SingleValue<{ value: string | number, label: string }>) =>
                        setSelectedCourseId(opt ? String(opt.value) : null)
                      }
                      isDisabled={coursesLoading}
                      placeholder={t('exam_admin.dual_table_drag_modal.course_filter') ?? 'Chọn khóa học'}
                    />
                  </div>
                )}

                {questionCategory === 'GROUP' && (
                  <div className="mt">
                    <Select<{ value: string | number, label: string }, false>
                      styles={customStyles(false)}
                      menuPlacement="top"
                      options={[
                        { value: 'ALL', label: 'Tất cả' },
                        ...(groupsLoading
                          ? [{ value: '', label: t('exam_admin.add_text_question_modal.loading') ?? 'Đang tải...' }]
                          : groups.map(g => ({ value: String(g.id), label: g.name }))
                        )
                      ]}
                      value={
                        selectedGroupId
                          ? {
                              value: selectedGroupId,
                              label:
                              selectedGroupId === 'ALL'
                                ? 'Tất cả'
                                : groups.find(g => String(g.id) === String(selectedGroupId))?.name || ''
                            }
                          : null
                      }
                      onChange={(opt: SingleValue<{ value: string | number, label: string }>) =>
                        setSelectedGroupId(opt ? String(opt.value) : null)
                      }
                      isDisabled={groupsLoading}
                      placeholder={t('exam_admin.dual_table_drag_modal.group_filter') ?? 'Chọn nhóm'}
                    />
                  </div>
                )}
              </div>
            )}
            {/* {questionText.length > 0 && !isQuestionManagement && (
              <div className="bg-yellow-50 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative flex items-center">
                <ReportProblemOutlinedIcon className="h-5 w-5 mr-2"/>
                <span className="block sm:inline">{t('exam_admin.add_text_question_modal.check_questions_before_confirm')}</span>
              </div>
            )} */}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t space-x-2">
          {/* TODO: Instruction button */}
          <button
            onClick={handleInstructionButtonClick}
            className="bg-orange-400 text-white px-4 py-2 rounded-md hover:bg-orange-500 hover:text-white">
            {t('exam_admin.add_text_question_modal.instruction')}
          </button>
          {/* TODO: Confirm add button */}
          <button
            onClick={handleConfirmAddQuestion}
            className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
          >
            {t('exam_admin.add_text_question_modal.confirm_add')}
          </button>
        </div>
        {/* TODO: Instruction modal */}
        {showInstruction && (
          <InstructionModal onClose={handleInstructionModalClose} />
        )}
      </div>
    </div>
  )
}

export default AddTextQuestionModal
