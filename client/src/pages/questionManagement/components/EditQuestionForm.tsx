/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import React, { useState, useEffect, useRef } from 'react'
import { Radio, Checkbox, Tooltip, Box } from '@mui/material'
import { QuillEditor } from '../../../components/QuillEditor'
import { toast } from 'react-toastify'
import { newQuestion } from '../../../api/post/post.interface'
import { updateQuestion } from '../../../api/post/post.api'
import { AxiosResponse } from 'axios'
import { ClipLoader } from 'react-spinners'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import {
  DndContext,
  closestCenter,
  DragEndEvent,
  DragOverlay
} from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Select, { SingleValue } from 'react-select'
import { useTranslation } from 'react-i18next'

const questionTypeOptions = [
  { value: 'SINGLE_CHOICE', label: 'Một đáp án' },
  { value: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' }
]

const questionCategoryOptions = [
  { value: 'COURSE', label: 'Dành cho khóa học' },
  { value: 'GROUP', label: 'Dành cho nghiệp vụ' }
]

interface Answer {
  id: string
  content: string
  isCorrect: boolean
}

interface Question {
  id: number
  instruction: string
  content: string
  type: string
  a: string
  b: string
  c: string
  d: string
  e: string
  f: string
  g: string
  h: string
  i: string
  j: string
  k: string
  l: string
  m: string
  n: string
  o: string
  p: string
  answer: string
  explanation: string
  answers?: Answer[]
}

interface EditQuestionFormProps {
  examId?: number
  selectedQuestion: Question | null
  fetchQuestions: () => Promise<void>
  setUpdatedQuestion?: (updatedQuestion: Question) => void
}

/**
 * SortableAnswer component for rendering a sortable answer option.
 *
 * @author Hien
 * @component
 * @param {object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered SortableAnswer component.
 */
const SortableAnswer = ({ answer, index, handleAnswerChange, handleCorrectChange, handleDeleteAnswer, questionType, canDelete }: { answer: Answer, index: number, handleAnswerChange: (index: number, value: string) => void, handleCorrectChange: (index: number) => void, handleDeleteAnswer: (index: number) => void, questionType: string, canDelete: boolean }): JSX.Element => {
  const { t } = useTranslation()
  // TODO: Initialize sortable functionality using useSortable hook
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: answer.id })
  // TODO: Define the style for the component based on dragging state
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1,
    marginBottom: '10px'
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      key={answer.id}
      className="bg-white flex items-center"
    >
      <DragHandleIcon className="cursor-pointer ml-2 focus:outline-none" {...attributes} {...listeners} />
      <div className="w-full min-w-0">
        <QuillEditor
          theme='snow'
          value={answer.content}
          onChange={(value) => handleAnswerChange(index, value)}
        />
      </div>
      <div className="flex items-center">
        {questionType === 'SINGLE_CHOICE'
          ? (
            <Radio
              checked={answer.isCorrect}
              onChange={() => handleCorrectChange(index)}
              value={index}
              name="answer-radio"
            />
            )
          : (
            <Checkbox
              checked={answer.isCorrect}
              onChange={() => handleCorrectChange(index)}
            />
            )}
            <Tooltip title={t('exam_admin.edit_question_form.remove_answer')}>
              <span>
                <button
                  className={`btn p-1.5 rounded-sm ${canDelete ? 'bg-red-500 hover:bg-red-400' : ''} ${!canDelete ? 'cursor-not-allowed' : ''}`}
                  style={!canDelete ? { backgroundColor: '#d2d6dc' } : {}}
                  onClick={() => canDelete && handleDeleteAnswer(index)}
                  disabled={!canDelete}
                >
                  <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                    <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                  </svg>
                </button>
              </span>
            </Tooltip>
      </div>
    </div>
  )
}

/**
 * EditQuestionForm component for editing existing questions.
 *
 * @author Hien
 * @component
 * @param {object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered EditQuestionForm component.
 */
const EditQuestionForm: React.FC<EditQuestionFormProps> = ({ selectedQuestion, fetchQuestions, examId, setUpdatedQuestion }): JSX.Element => {
  const { t } = useTranslation()
  const maxAnswers = 16
  // TODO: Initialize state for loading indicator
  const [loading, setLoading] = useState(false)
  // TODO: Use useRef to track the mounted state of the component
  const isMounted = useRef(true)
  // TODO: Initialize state for active draggable item
  const [activeId, setActiveId] = useState<string | null>(null)
  // TODO: Determine if the component is used in question management page
  const isQuestionManagement = location.pathname === '/question-bank'
  // TODO: Initialize state for question category
  const [questionCategory, setQuestionCategory] = useState('')
  // TODO: Initialize state for the new question
  const [newQuestionState, setNewQuestionState] = useState<newQuestion>({
    examId,
    instruction: '',
    content: '',
    type: 'SINGLE_CHOICE',
    a: '',
    b: '',
    c: '',
    d: '',
    e: '',
    f: '',
    g: '',
    h: '',
    i: '',
    j: '',
    k: '',
    l: '',
    m: '',
    n: '',
    o: '',
    p: '',
    answer: '',
    explanation: ''
  })

  const [editorKeys, setEditorKeys] = useState({
    instruction: `instruction-editor-${Date.now()}`,
    content: `content-editor-${Date.now()}`,
    explanation: `explanation-editor-${Date.now()}`
  })

  // TODO: Initialize state for answers
  const [answers, setAnswers] = useState<Answer[]>(
    Array.from({ length: 2 }, (_, index) => ({ id: `answer-${index}`, content: '', isCorrect: false }))
  )

  // TODO: Initialize state for question type
  const [questionType, setQuestionType] = useState('SINGLE_CHOICE')

  // TODO: Use useEffect to handle component mounting and unmounting
  useEffect(() => {
    isMounted.current = true
    return () => {
      isMounted.current = false
    }
  }, [])
  // TODO: Use useEffect to update the state when the selectedQuestion changes
  useEffect(() => {
    setLoading(true)

    const initializeQuestion = async () => {
      if (selectedQuestion) {
        const initialAnswers = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p']
          .filter(key => selectedQuestion[key as keyof Question])
          .map((key, index) => ({
            id: `answer-${index}`,
            content: selectedQuestion[key as keyof Question] as string,
            isCorrect: selectedQuestion.answer.split('::').includes(key)
          }))

        setAnswers(initialAnswers)
        setNewQuestionState(prev => ({
          ...prev,
          content: selectedQuestion.content,
          explanation: selectedQuestion.explanation,
          instruction: selectedQuestion.instruction,
          type: selectedQuestion.type,
          a: selectedQuestion.a,
          b: selectedQuestion.b,
          c: selectedQuestion.c,
          d: selectedQuestion.d,
          e: selectedQuestion.e,
          f: selectedQuestion.f,
          g: selectedQuestion.g,
          h: selectedQuestion.h,
          i: selectedQuestion.i,
          j: selectedQuestion.j,
          k: selectedQuestion.k,
          l: selectedQuestion.l,
          m: selectedQuestion.m,
          n: selectedQuestion.n,
          o: selectedQuestion.o,
          p: selectedQuestion.p
        }))
        if ((selectedQuestion as any).category) {
          setQuestionCategory((selectedQuestion as any).category)
        }
        setQuestionType(selectedQuestion.type)

        // Đợi React re-render và QuillEditor khởi tạo
        await new Promise(resolve => setTimeout(resolve, 100))
      }

      setLoading(false)
    }

    initializeQuestion()
  }, [selectedQuestion])

  /**
   * Handles the change of the instruction content.
   * @author Hien
   * @param {string} value - The new instruction content.
   */
  const handleInstructionChange = (value: string): void => {
    setNewQuestionState(prev => ({ ...prev, instruction: value }))
  }

  /**
   * Handles the change of the question content.
   * @author Hien
   * @param {string} value - The new question content.
   */
  const handleQuestionContentChange = (value: string): void => {
    setNewQuestionState(prev => ({ ...prev, content: value }))
  }

  /**
   * Handles the change of an answer's content.
   * @author Hien
   * @param {number} index - The index of the answer to change.
   * @param {string} value - The new content of the answer.
   */
  const handleAnswerChange = (index: number, value: string): void => {
    const newAnswers = [...answers]
    newAnswers[index].content = value
    setAnswers(newAnswers)
  }

  /**
   * Handles the change of an answer's correctness.
   * @author Hien
   * @param {number} index - The index of the answer to change.
   */
  const handleCorrectChange = (index: number): void => {
    // TODO: Create a copy of the answers array
    const newAnswers = [...answers]
    // TODO: If the question type is single choice, set all answers to incorrect except the selected one
    if (questionType === 'SINGLE_CHOICE') {
      newAnswers.forEach((answer, i) => {
        answer.isCorrect = i === index
      })
    } else {
      // TODO: If the question type is multiple choice, toggle the correctness of the selected answer
      newAnswers[index].isCorrect = !newAnswers[index].isCorrect
    }
    setAnswers(newAnswers)
  }

  /**
   * Handles adding a new answer.
   * @author Hien
   */
  const handleAddAnswer = (): void => {
    // TODO: Check if the number of answers is less than the maximum allowed
    if (answers.length < maxAnswers) {
      // TODO: Add a new answer to the answers array
      setAnswers([...answers, { id: `answer-${answers.length}`, content: '', isCorrect: false }])
    } else {
      // TODO: Show an error message if the maximum number of answers is reached
      toast.error(t('exam_admin.add_question_form.toast.max_answer_limit'))
    }
  }

  /**
   * Handles deleting an answer.
   * @author Hien
   * @param {number} index - The index of the answer to delete.
   */
  const handleDeleteAnswer = (index: number): void => {
    // Filter out the deleted answer first
    const filteredAnswers = answers.filter((_, i) => i !== index)

    // Rebuild IDs to ensure they're sequential and force proper re-initialization
    const rebuiltAnswers = filteredAnswers.map((answer, i) => ({
      ...answer,
      id: `answer-${i}-${Date.now()}`
    }))

    // Regenerate keys for all editor instances to force proper re-initialization
    setEditorKeys({
      instruction: `instruction-editor-${Date.now()}`,
      content: `content-editor-${Date.now()}`,
      explanation: `explanation-editor-${Date.now()}`
    })

    setAnswers(rebuiltAnswers)
  }

  /**
   * Handles the submission of the form.
   * @author Hien
   */
  const handleSubmit = async (): Promise<void> => {
    const maxCharacters = 16383
    // TODO: Check if the question content is empty
    if (!newQuestionState.instruction || newQuestionState.instruction.replace(/<\/?[^>]+(>|$)/g, '').trim().length === 0) {
      toast.error(t('exam_admin.edit_question_form.toast.instruction_required'))
      return
    }
    if (!newQuestionState.content || newQuestionState.content.replace(/<\/?[^>]+(>|$)/g, '').length === 0) {
      toast.error(t('exam_admin.edit_question_form.toast.question_required'))
      return
    }
    // TODO: Check character limits for instruction, content, and explanation
    if (newQuestionState.instruction.length > maxCharacters) {
      toast.error(t('exam_admin.add_question_form.toast.instruction_too_long'))
      return
    }
    if (newQuestionState.content.length > maxCharacters) {
      toast.error(t('exam_admin.add_question_form.toast.content_too_long'))
      return
    }
    if (newQuestionState.explanation.length > maxCharacters) {
      toast.error(t('exam_admin.add_question_form.toast.explanation_too_long'))
      return
    }
    // TODO: Check if any answer exceeds character limit
    const answerTooLong = answers.some((answer) => answer.content.length > maxCharacters)
    if (answerTooLong) {
      toast.error(t('exam_admin.add_question_form.toast.answer_too_long'))
      return
    }

    // TODO: Improved empty answer validation for QuillEditor
    const hasEmptyAnswer = answers.some((answer) => {
      // Remove HTML tags and check if content is empty
      const textContent = answer.content.replace(/<\/?[^>]+(>|$)/g, '').trim()
      return textContent === ''
    })

    // TODO: Filter out empty answers - also updated to handle HTML content
    const filteredAnswers = answers.filter((answer) => {
      const textContent = answer.content.replace(/<\/?[^>]+(>|$)/g, '').trim()
      return textContent !== ''
    })

    // TODO: Check if any answer is empty
    if (hasEmptyAnswer) {
      toast.error(t('exam_admin.edit_question_form.toast.answer_required'))
      return
    }

    // TODO: Check if there are less than 2 answers
    if (filteredAnswers.length < 2) {
      toast.error(t('exam_admin.edit_question_form.toast.at_least_2_answers'))
      return
    }

    // TODO: Check if any answer is correct
    if (!answers.some((answer) => answer.isCorrect)) {
      toast.error(t('exam_admin.edit_question_form.toast.choose_correct_answer'))
      return
    }

    // TODO: Map correct answers to a string
    const correctAnswers = answers
      .map((answer, index) => (answer.isCorrect ? String.fromCharCode(97 + index) : null))
      .filter(Boolean)
      .join('::')

    // TODO: Check if there are any correct answers
    if (correctAnswers.length === 0) {
      toast.error(t('exam_admin.edit_question_form.toast.choose_correct_answer'))
      return
    }

    if (!newQuestionState.explanation || newQuestionState.explanation.replace(/<\/?[^>]+(>|$)/g, '').trim().length === 0) {
      toast.error(t('exam_admin.edit_question_form.toast.explanation_required'))
      return
    }
    // TODO: Update the question with the answers and other properties
    const updatedQuestion: Partial<newQuestion> = {
      a: answers[0]?.content ?? '',
      b: answers[1]?.content ?? '',
      c: answers[2]?.content ?? '',
      d: answers[3]?.content ?? '',
      e: answers[4]?.content ?? '',
      f: answers[5]?.content ?? '',
      g: answers[6]?.content ?? '',
      h: answers[7]?.content ?? '',
      i: answers[8]?.content ?? '',
      j: answers[9]?.content ?? '',
      k: answers[10]?.content ?? '',
      l: answers[11]?.content ?? '',
      m: answers[12]?.content ?? '',
      n: answers[13]?.content ?? '',
      o: answers[14]?.content ?? '',
      p: answers[15]?.content ?? '',
      answer: correctAnswers,
      explanation: newQuestionState.explanation,
      instruction: newQuestionState.instruction,
      content: newQuestionState.content,
      type: newQuestionState.type,
      category: questionCategory
    }

    // TODO: Check if the question has been changed
    if (selectedQuestion) {
      const unchanged =
            updatedQuestion.instruction === selectedQuestion.instruction &&
            updatedQuestion.content === selectedQuestion.content &&
            updatedQuestion.explanation === selectedQuestion.explanation &&
            updatedQuestion.type === selectedQuestion.type &&
            updatedQuestion.a === selectedQuestion.a &&
            updatedQuestion.b === selectedQuestion.b &&
            updatedQuestion.c === selectedQuestion.c &&
            updatedQuestion.d === selectedQuestion.d &&
            updatedQuestion.e === selectedQuestion.e &&
            updatedQuestion.f === selectedQuestion.f &&
            updatedQuestion.g === selectedQuestion.g &&
            updatedQuestion.h === selectedQuestion.h &&
            updatedQuestion.i === selectedQuestion.i &&
            updatedQuestion.j === selectedQuestion.j &&
            updatedQuestion.k === selectedQuestion.k &&
            updatedQuestion.l === selectedQuestion.l &&
            updatedQuestion.m === selectedQuestion.m &&
            updatedQuestion.n === selectedQuestion.n &&
            updatedQuestion.o === selectedQuestion.o &&
            updatedQuestion.p === selectedQuestion.p &&
            updatedQuestion.answer === selectedQuestion.answer &&
            (isQuestionManagement ? (((selectedQuestion as any).category ?? '') === questionCategory) : true)
      if (unchanged) {
        toast.info(t('exam_admin.edit_question_form.toast.no_changes'))
        return
      }
    }

    // TODO: Update the newQuestionState with the updated question
    const newState = await updateNewQuestion(updatedQuestion)
    setLoading(true)
    try {
      if (!selectedQuestion) return
      if (!isQuestionManagement) {
        delete newState.category
      }
      const response: AxiosResponse<any> = await updateQuestion(selectedQuestion.id.toString(), {
        ...newState,
        examId
      })
      if (response.status === 200) {
        if (response.data?.newQuestion?.id) {
          setUpdatedQuestion?.(response.data.newQuestion)
        }
        toast.success(t('exam_admin.edit_question_form.toast.update_success'))
        if (isMounted.current) {
          await fetchQuestions()
        }
      }
    } catch (error) {
      toast.error(t('exam_admin.edit_question_form.toast.update_failed'))
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }

  /**
   * Updates the new question state.
   * @author Hien
   * @param {Partial<newQuestion>} updatedQuestion - The updated question.
   * @returns {Promise<newQuestion>} The new question state.
   */
  const updateNewQuestion = async (updatedQuestion: Partial<newQuestion>): Promise<newQuestion> => {
    return await new Promise((resolve) => {
      setNewQuestionState((prevState) => {
        const newState = {
          ...prevState,
          ...updatedQuestion
        }
        resolve(newState)
        return newState
      })
    })
  }

  /**
   * Handles the change of the explanation content.
   * @author Hien
   * @param {string} value - The new explanation content.
   */
  const handleExplanationChange = (value: string): void => {
    setNewQuestionState(prev => ({ ...prev, explanation: value }))
  }

  /**
   * Handles the change of the question type using react-select.
   * @author Hien
   * @param {SingleValue<{ value: string, label: string }>} selectedOption - The selected option.
   */
  const handleQuestionTypeChangeReactSelect = (
    selectedOption: SingleValue<{ value: string, label: string }>
  ): void => {
    // TODO: Check if an option is selected
    if (selectedOption) {
      const newType = selectedOption.value
      setQuestionType(newType)
      setNewQuestionState(prev => ({ ...prev, type: newType }))
      const newAnswers = answers.map(answer => ({ ...answer, isCorrect: false }))
      setAnswers(newAnswers)
    }
  }

  /**
   * Handles the change of the question category.
   * @author Hien
   * @param {SingleValue<{ value: string, label: string }>} selectedOption - The selected option.
   */
  const handleQuestionCategoryChange = (
    selectedOption: SingleValue<{ value: string, label: string }>
  ): void => {
    // TODO: Check if an option is selected
    if (selectedOption) {
      setQuestionCategory(selectedOption.value)
      setNewQuestionState(prev => ({ ...prev, category: selectedOption.value }))
    }
  }

  /**
   * Handles the start of a drag operation.
   * @author Hien
   * @param {any} event - The drag start event.
   */
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  /**
   * Handles the end of a drag operation.
   * @author Hien
   * @param {DragEndEvent} event - The drag end event.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    // TODO: If the item was dropped outside of a droppable area, do nothing
    if (!over || active.id === over.id) {
      return
    }

    // TODO: Find the old and new indexes of the dragged item
    const oldIndex = answers.findIndex(item => item.id === active.id)
    const newIndex = answers.findIndex(item => item.id === over.id)

    // TODO: Move the item in the answers array
    const newAnswers = arrayMove(answers, oldIndex, newIndex)

    // Rebuild IDs with timestamps to ensure proper re-initialization
    const rebuiltAnswers = newAnswers.map((answer, i) => ({
      ...answer,
      id: `answer-${i}-${Date.now()}`
    }))

    // Regenerate keys for all editor instances to force proper re-initialization
    setEditorKeys({
      instruction: `instruction-editor-${Date.now()}`,
      content: `content-editor-${Date.now()}`,
      explanation: `explanation-editor-${Date.now()}`
    })

    // Set the rebuilt answers array
    setAnswers(rebuiltAnswers)
  }

  // TODO: Find the active item
  const activeItem = answers.find(item => item.id === activeId)

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-[60vh]">
          <ClipLoader color="#5EEAD4" loading={loading} size={40} />
        </div>
      ) : selectedQuestion ? (
        <div className="flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t('exam_admin.edit_question_form.edit_question')}</h2>
          </div>
          <div className="flex flex-wrap gap-8">
            <div className="mb-4 w-1/3 flex flex-col">
              <label className="font-semibold mb-2">{t('exam_admin.edit_question_form.question_type')}</label>
              <Select
                value={questionTypeOptions.find((option) => option.value === questionType)}
                onChange={handleQuestionTypeChangeReactSelect}
                options={questionTypeOptions}
                placeholder={t('exam_admin.edit_question_form.question_type')}
                formatOptionLabel={(option) => t(`exam_admin.edit_question_form.${option.value === 'SINGLE_CHOICE' ? 'single_choice' : 'multiple_choice'}`)}
              />
            </div>
            {isQuestionManagement && (
              <div className="mb-4 w-1/3 flex flex-col">
                <label className="font-semibold mb-2">{t('exam_admin.edit_question_form.question_category')}</label>
                <Select
                  value={questionCategoryOptions.find((option) => option.value === questionCategory)}
                  onChange={handleQuestionCategoryChange}
                  options={questionCategoryOptions}
                  placeholder={t('exam_admin.edit_question_form.question_category')}
                  formatOptionLabel={(option) => t(`exam_admin.edit_question_form.${option.value === 'COURSE' ? 'for_course' : 'for_group'}`)}
                />
              </div>
            )}
          </div>
          {/* Instruction Section */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">{t('exam_admin.edit_question_form.instruction')}</h3>
            <QuillEditor
              key={editorKeys.instruction}
              theme="snow"
              value={newQuestionState.instruction}
              onChange={handleInstructionChange}
            />
          </div>

          {/* Question Content Section */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">{t('exam_admin.edit_question_form.question_content')}</h3>
            <QuillEditor
              key={editorKeys.content}
              theme="snow"
              value={newQuestionState.content}
              onChange={handleQuestionContentChange}
            />
          </div>

          {/* Answers Section */}
          <div className="mb-4">
            <h3 className="font-semibold mb-2">{t('exam_admin.edit_question_form.answers')}</h3>
            <DndContext
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              modifiers={[restrictToVerticalAxis, restrictToParentElement]}
            >
              <SortableContext
                items={answers.map(answer => answer.id)}
                strategy={verticalListSortingStrategy}
              >
                <div style={{ backgroundColor: activeId ? '#f0f0f0' : 'transparent' }}>
                  {answers.map((answer, index) => (
                    <SortableAnswer
                      key={answer.id}
                      answer={answer}
                      index={index}
                      handleAnswerChange={handleAnswerChange}
                      handleCorrectChange={handleCorrectChange}
                      handleDeleteAnswer={handleDeleteAnswer}
                      questionType={questionType}
                      canDelete={answers.length > 2}
                    />
                  ))}
                </div>
              </SortableContext>
              <DragOverlay>
                {activeItem && (
                  <div
                    style={{ backgroundColor: '#EFF6FF' }}
                    className="bg-white flex items-center">
                    <DragHandleIcon className="cursor-move ml-2 focus:outline-none" />
                    <div className="w-full min-w-0">
                      <QuillEditor
                        theme='snow'
                        value={activeItem.content}
                        onChange={() => { }}
                      />
                    </div>
                    <div className="flex items-center">
                      {questionType === 'SINGLE_CHOICE'
                        ? (
                          <Radio
                            checked={activeItem.isCorrect}
                          />
                          )
                        : (
                          <Checkbox
                            checked={activeItem.isCorrect}
                          />
                          )}
                      <Tooltip title={t('exam_admin.edit_question_form.remove_answer')}>
                         <span>
                           <button
                             className={`btn p-1.5 rounded-sm ${(answers.length > 2) ? 'bg-red-500 hover:bg-red-400' : ''} ${!(answers.length > 2) ? 'cursor-not-allowed' : ''}`}
                             style={!(answers.length > 2) ? { backgroundColor: '#d2d6dc' } : {}}
                             disabled={!(answers.length > 2)}
                           >
                             <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                               <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                             </svg>
                           </button>
                         </span>
                       </Tooltip>
                    </div>
                  </div>
                )}
              </DragOverlay>
            </DndContext>
            <div className="flex justify-start">
              <Box>
                <Tooltip title={t('exam_admin.edit_question_form.add_answer')}>
                  <span>
                    <button
                      className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm"
                      onClick={handleAddAnswer}
                    >
                      <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                        <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                      </svg>
                    </button>
                  </span>
                </Tooltip>
              </Box>
            </div>

            {/* Explanation Section */}
            <div className="mt-2">
              <h3 className="font-semibold mb-2">{t('exam_admin.edit_question_form.explanation')}</h3>
              <QuillEditor
                key={editorKeys.explanation}
                theme="snow"
                value={newQuestionState.explanation}
                onChange={handleExplanationChange}
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end w-full mt-4">
            <div
              onClick={() => {
                handleSubmit().catch(error => {
                  console.error('Error while submitting:', error)
                })
              }}
              className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
            >
              {t('exam_admin.edit_question_form.save_changes')}
            </div>
          </div>
        </div>
      ) : (
        <p>{t('exam_admin.edit_question_form.select_a_question')}</p>
      )}
    </>
  )
}

export default EditQuestionForm
