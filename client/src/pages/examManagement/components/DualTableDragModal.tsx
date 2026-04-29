/* eslint-disable @typescript-eslint/restrict-plus-operands */
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
========================================================================= */
import React, { useState, useEffect } from 'react'
import { Question } from '../../../api/post/post.interface'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  closestCenter,
  Modifiers,
  useDroppable
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { restrictToParentElement } from '@dnd-kit/modifiers'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import KeyboardBackspaceIcon from '@mui/icons-material/KeyboardBackspace'
import { Button, Checkbox, TextField } from '@mui/material'
import { toast } from 'react-toastify'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CancelIcon from '@mui/icons-material/Cancel'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getQuestionExam, getQuestionsByCategory, duplicateUpdateOrder, fetchAllCourses, fetchAllGroups } from 'api/post/post.api'
import Pagination from '@mui/material/Pagination'
import { ClipLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'
import QuillShow from '../../../components/QuillEditor'
import SearchIcon from '@mui/icons-material/Search'
import FilterAltTwoToneIcon from '@mui/icons-material/FilterAltTwoTone'
import Select, { SingleValue, StylesConfig } from 'react-select'

interface DualTableDragModalProps {
  examId: number
  onClose: () => void
  onSuccess: () => void
  examDetail: any
}

interface SortableItemProps {
  question: Question
  containerId: string
  index: number
  showCheckbox?: boolean
  checked?: boolean
  onToggleCheckbox?: (questionId: number) => void
  highlight?: boolean
  onRemoveHighlight?: (questionId: number) => void
}

/**
 * Removes image tags from an HTML string.
 *
 * @author Hien
 * @param {string} html - The HTML string to remove images from.
 * @returns {string} The HTML string with image tags removed.
 */
const removeImagesFromHtml = (html: string): string => {
  return html.replace(/<img[^>]*>/gi, '')
}

/**
 * LeftDropZone component for the left drop zone in the dual table drag modal.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered LeftDropZone component.
 */
function LeftDropZone ({ children }: { children: React.ReactNode }) {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Use the useDroppable hook to create a droppable zone
  const { setNodeRef } = useDroppable({ id: 'left-dropzone' })

  return (
    <div className="w-1/2 border p-2 transition-all duration-500 flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-center font-semibold">{t('exam_admin.dual_table_drag_modal.question_list_exam')}</h3>
      </div>
      {/* Content */}
      <div ref={setNodeRef} className="flex-grow overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

/**
 * SortableItem component for the sortable items in the dual table drag modal.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered SortableItem component.
 */
function SortableItem ({
  question,
  containerId,
  index,
  showCheckbox = false,
  checked = false,
  onToggleCheckbox,
  disabled = false,
  highlight = false,
  onRemoveHighlight
}: SortableItemProps & { disabled?: boolean }) {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Use the useSortable hook to create a sortable item
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${containerId}-${question.id}`,
    disabled
  })
  // TODO: Initialize state for the show details flag
  const [showDetails, setShowDetails] = useState(false)
  /**
   * Renders the content of the question.
   *
   * @author Hien
   * @returns {JSX.Element} The rendered content of the question.
   */
  const renderContent = () => {
    if (showDetails) {
      return (
        <div>
          <QuillShow htmlContent={question.content || ''} />
        </div>
      )
    } else {
      return (
        <div>
           <QuillShow htmlContent={removeImagesFromHtml(question.content || '')} />
        </div>
      )
    }
  }
  // TODO: Define the style for the sortable item
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : (disabled ? 0.5 : 1),
    pointerEvents: disabled ? 'none' : 'auto',
    border: highlight ? '2px solid blue' : undefined
  }
  /**
   * Handles the click event.
   *
   * @author Hien
   */
  const handleClick = () => {
    if (highlight && onRemoveHighlight) {
      onRemoveHighlight(question.id)
    }
  }
  return (
    <div
      id={containerId === 'left' ? `table1-item-${question.id}` : undefined}
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...(!disabled ? listeners : {})}
      onClick={handleClick}
      className="bg-gray-50 border border-gray-200 rounded-md p-3 flex cursor-default mb-2"
    >
      <div className="flex flex-col items-center">
        <DragHandleIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
        {showCheckbox && (
          <Checkbox
            onPointerDown={(e) => e.stopPropagation()}
            checked={checked}
            onChange={() => onToggleCheckbox?.(question.id)}
            onClick={(e) => e.stopPropagation()}
          />
        )}
      </div>
      <div className="flex-1 ml-3">
        <div className="flex items-center justify-between">
        <span className="font-bold">
          {t('exam_admin.dual_table_drag_modal.question')} {containerId === 'right' && question.originalIndex !== undefined
            ? (question.originalIndex + 1)
            : (index + 1)
          }:
        </span>

          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={(e) => {
              e.stopPropagation()
              setShowDetails(!showDetails)
            }}
            className="text-sm text-blue-500 focus:outline-none"
          >
            {showDetails ? <ExpandLessIcon /> : <ExpandMoreIcon />}
          </button>
        </div>
        <div className="ml-0">
          {question && renderContent()}
          {showDetails && (
            <div className="mt-2 p-2 bg-gray-100 rounded">
              <div>
              <strong>{t('exam_admin.dual_table_drag_modal.question_type')}:</strong> {question.type === 'SINGLE_CHOICE' ? t('exam_admin.dual_table_drag_modal.single_answer') : t('exam_admin.dual_table_drag_modal.multiple_answers')}
              </div>
              <div>
              <strong>{t('exam_admin.dual_table_drag_modal.answer_instruction')}:</strong>
              <QuillShow htmlContent={question.instruction || ''} />
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
              <strong>{t('exam_admin.dual_table_drag_modal.correct_answer_explanation')}:</strong>
                <QuillShow htmlContent={question.explanation || ''} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * DualTableDragModal component for the dual table drag modal.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered DualTableDragModal component.
 */
export default function DualTableDragModal ({ examId, onClose, onSuccess, examDetail }: DualTableDragModalProps) {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize state for the left items
  const [leftItems, setLeftItems] = useState<Question[]>([])
  // TODO: Initialize state for the right items
  const [rightItems, setRightItems] = useState<Question[]>([])
  // TODO: Initialize state for the right pagination
  const [rightPagination, setRightPagination] = useState({
    currentPage: 0,
    pageSize: 10,
    totalItems: 0,
    totalPages: 0
  })
  // TODO: Initialize state for the active ID
  const [activeId, setActiveId] = useState<string | null>(null)
  // TODO: Initialize state for the selected right IDs
  const [selectedRightIds, setSelectedRightIds] = useState<Set<number>>(new Set())
  // TODO: Initialize state for the is dragging left flag
  const [isDraggingLeft, setIsDraggingLeft] = useState(false)
  // TODO: Initialize state for the highlighted IDs
  const [highlightedIds, setHighlightedIds] = useState<Set<number>>(new Set())
  // TODO: Initialize state for the moved from right IDs
  const [movedFromRightIds, setMovedFromRightIds] = useState<Set<number>>(new Set())
  // TODO: Initialize state for the list loading flag
  const [listLoading, setListLoading] = useState(false)
  // TODO: Initialize state for the loading flag
  const [loading, setLoading] = useState(false)
  const [searchKeyword, setSearchKeyword] = useState('')
  const [pendingKeyword, setPendingKeyword] = useState('')
  const [coursesList, setCoursesList] = useState<Array<{ id: number | string, name: string }>>([])
  const [groupsList, setGroupsList] = useState<Array<{ id: number | string, name: string }>>([])
  const [filterCourseId, setFilterCourseId] = useState<string | number | ''>('')
  const [filterGroupId, setFilterGroupId] = useState<string | number | ''>('')
  const [coursesLoading, setCoursesLoading] = useState(false)
  const [groupsLoading, setGroupsLoading] = useState(false)
  const [openFilter, setOpenFilter] = useState(false)
  const [tempFilterCourseId, setTempFilterCourseId] = useState<number | ''>('')
  const [tempFilterGroupId, setTempFilterGroupId] = useState<number | ''>('')
  // TODO: Initialize state for temporary question type filter
  const [tempQuestionTypeFilter, setTempQuestionTypeFilter] = useState('')
  // TODO: Initialize state for temporary exam usage filter
  const [tempExamUsageFilter, setTempExamUsageFilter] = useState('')
  const [isClearable, setIsClearable] = useState(true)
  const [questionTypeFilter, setQuestionTypeFilter] = useState('')
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
    totalPages: 0,
    totalItems: 0
  })
  const [examUsageFilter, setExamUsageFilter] = useState('')

  const loadCourses = async () => {
    setCoursesLoading(true)
    try {
      const res = await fetchAllCourses()
      setCoursesList(res.data?.data ?? res.data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setCoursesLoading(false)
    }
  }

  const loadGroups = async () => {
    setGroupsLoading(true)
    try {
      const res = await fetchAllGroups()
      setGroupsList(res.data?.data ?? res.data ?? [])
    } catch (e) {
      console.error(e)
    } finally {
      setGroupsLoading(false)
    }
  }
  // load choices when examDetail indicates course/group
  useEffect(() => {
    if (examDetail?.courseId) {
      void loadCourses()
    }
    if (examDetail?.groupId) {
      void loadGroups()
    }
  }, [examDetail])
  /**
   * Fetches the left questions.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const fetchLeftQuestions = async () => {
    setLoading(true)
    try {
      const res = await getQuestionExam(examId ?? 0)
      const data = res.data
      const formattedLeft = data.map((q: any) => {
        const answers = []
        if (q.a) answers.push({ content: q.a, isCorrect: q.answer.includes('a') })
        if (q.b) answers.push({ content: q.b, isCorrect: q.answer.includes('b') })
        if (q.c) answers.push({ content: q.c, isCorrect: q.answer.includes('c') })
        if (q.d) answers.push({ content: q.d, isCorrect: q.answer.includes('d') })
        if (q.e) answers.push({ content: q.e, isCorrect: q.answer.includes('e') })
        if (q.f) answers.push({ content: q.f, isCorrect: q.answer.includes('f') })
        if (q.g) answers.push({ content: q.g, isCorrect: q.answer.includes('g') })
        if (q.h) answers.push({ content: q.h, isCorrect: q.answer.includes('h') })
        if (q.i) answers.push({ content: q.i, isCorrect: q.answer.includes('i') })
        if (q.j) answers.push({ content: q.j, isCorrect: q.answer.includes('j') })
        if (q.k) answers.push({ content: q.k, isCorrect: q.answer.includes('k') })
        if (q.l) answers.push({ content: q.l, isCorrect: q.answer.includes('l') })
        if (q.m) answers.push({ content: q.m, isCorrect: q.answer.includes('m') })
        if (q.n) answers.push({ content: q.n, isCorrect: q.answer.includes('n') })
        if (q.o) answers.push({ content: q.o, isCorrect: q.answer.includes('o') })
        if (q.p) answers.push({ content: q.p, isCorrect: q.answer.includes('p') })
        return {
          id: q.id,
          answers,
          type: q.type,
          instruction: q.instruction,
          content: q.content,
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d,
          e: q.e,
          f: q.f,
          g: q.g,
          h: q.h,
          i: q.i,
          j: q.j,
          k: q.k,
          l: q.l,
          m: q.m,
          n: q.n,
          o: q.o,
          p: q.p,
          answer: q.answer,
          explanation: q.explanation
        }
      })
      if (leftItems.length === 0) {
        setLeftItems(formattedLeft)
      }
    } catch (error) {
      console.error('Error fetching left questions:', error)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Fetches the right questions.
   *
   * @author Hien
   * @async
   * @param {number} page - The page number to fetch.
   * @returns {Promise<void>}
   */
  const fetchRightQuestions = async (page = 0, filter?: { filterOption: string | undefined }) => {
    setListLoading(true)
    const pageSize = rightPagination.pageSize
    const start = page * pageSize
    console.log('Fetching right questions:', { page, start, pageSize })
    console.log('Exam Detail:', examDetail)
    const filterOption = examDetail?.groupId ? 'GROUP' : examDetail?.courseId ? 'COURSE' : 'COURSE'

    let targetId: number | null = null
    let targetType: string | null = null
    if (filterCourseId !== '' && filterCourseId !== null) {
      targetId = Number(filterCourseId)
      targetType = 'COURSE'
    } else if (filterGroupId !== '' && filterGroupId !== null) {
      targetId = Number(filterGroupId)
      targetType = 'GROUP'
    }

    try {
      const params: any = {
        filterOption,
        questionTypeFilter: questionTypeFilter ?? '',
        examUsageFilter: examUsageFilter ?? '',
        start: Number(start),
        size: Number(pageSize),
        search: String(searchKeyword || '')
      }

      if (targetId !== null && !Number.isNaN(targetId)) {
        params.target_id = targetId
        params.targetId = targetId
      }
      if (targetType) {
        params.targetType = targetType
      }

      console.log('Params gửi API:', params)

      const res = await getQuestionsByCategory(params)
      const data = res.data.data
      const totalItems = res.data.meta?.total || data.length
      const totalPages = Math.ceil(totalItems / pageSize)
      setRightPagination({ currentPage: page, pageSize, totalItems, totalPages })

      const formattedRight = data.map((q: any, i: number) => {
        const answers = []
        if (q.a) answers.push({ content: q.a, isCorrect: q.answer.includes('a') })
        if (q.b) answers.push({ content: q.b, isCorrect: q.answer.includes('b') })
        if (q.c) answers.push({ content: q.c, isCorrect: q.answer.includes('c') })
        if (q.d) answers.push({ content: q.d, isCorrect: q.answer.includes('d') })
        if (q.e) answers.push({ content: q.e, isCorrect: q.answer.includes('e') })
        if (q.f) answers.push({ content: q.f, isCorrect: q.answer.includes('f') })
        if (q.g) answers.push({ content: q.g, isCorrect: q.answer.includes('g') })
        if (q.h) answers.push({ content: q.h, isCorrect: q.answer.includes('h') })
        if (q.i) answers.push({ content: q.i, isCorrect: q.answer.includes('i') })
        if (q.j) answers.push({ content: q.j, isCorrect: q.answer.includes('j') })
        if (q.k) answers.push({ content: q.k, isCorrect: q.answer.includes('k') })
        if (q.l) answers.push({ content: q.l, isCorrect: q.answer.includes('l') })
        if (q.m) answers.push({ content: q.m, isCorrect: q.answer.includes('m') })
        if (q.n) answers.push({ content: q.n, isCorrect: q.answer.includes('n') })
        if (q.o) answers.push({ content: q.o, isCorrect: q.answer.includes('o') })
        if (q.p) answers.push({ content: q.p, isCorrect: q.answer.includes('p') })
        return {
          id: q.id,
          answers,
          type: q.type,
          instruction: q.instruction,
          content: q.content,
          a: q.a,
          b: q.b,
          c: q.c,
          d: q.d,
          e: q.e,
          f: q.f,
          g: q.g,
          h: q.h,
          i: q.i,
          j: q.j,
          k: q.k,
          l: q.l,
          m: q.m,
          n: q.n,
          o: q.o,
          p: q.p,
          answer: q.answer,
          explanation: q.explanation,
          originalIndex: start + i
        }
      })
      setRightItems(formattedRight)
    } finally {
      setListLoading(false)
    }
  }
  useEffect(() => {
    fetchLeftQuestions()
    fetchRightQuestions(0)
  }, [examId, searchKeyword, filterCourseId, filterGroupId, questionTypeFilter, examUsageFilter])

  // TODO: Define the active question
  const activeQuestion = (() => {
    if (!activeId) return null
    const [containerId, qId] = activeId.split('-')
    return containerId === 'left'
      ? leftItems.find(q => q.id.toString() === qId)
      : rightItems.find(q => q.id.toString() === qId)
  })()

  /**
   * Handles the drag start event.
   *
   * @author Hien
   * @param {any} event - The drag start event.
   */
  function handleDragStart (event: any) {
    setActiveId(event.active.id)
    const [containerId] = String(event.active.id).split('-')
    setIsDraggingLeft(containerId === 'left')
  }

  /**
   * Handles the drag end event.
   *
   * @author Hien
   * @param {DragEndEvent} event - The drag end event.
   */
  function handleDragEnd (event: DragEndEvent) {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const [activeContainer, activeQId] = String(active.id).split('-')
    const [overContainer, overQId] = String(over.id).split('-')

    // TODO: Check if the active and over containers are the same
    if (activeContainer === overContainer) {
      if (activeContainer === 'right') {
        toast.warning(t('exam_admin.dual_table_drag_modal.not_support_sort_table2'))
        return
      }
      const oldIndex = leftItems.findIndex(q => q.id.toString() === activeQId)
      const newIndex = leftItems.findIndex(q => q.id.toString() === overQId)
      if (oldIndex !== newIndex && newIndex !== -1) {
        setLeftItems(arrayMove(leftItems, oldIndex, newIndex))
      }
    } else {
      // TODO: Check if the active container is the left container and the over container is the right container
      if (activeContainer === 'left' && overContainer === 'right') return
      const fromContainer = activeContainer as 'left' | 'right'
      const toContainer = overContainer as 'left' | 'right'
      const movingItem = fromContainer === 'left'
        ? leftItems.find(q => q.id.toString() === activeQId)
        : rightItems.find(q => q.id.toString() === activeQId)
      if (!movingItem) return

      // TODO: Check if the from container is the right container and the to container is the left container
      if (fromContainer === 'right' && toContainer === 'left') {
        setLeftItems(prev => [...prev, movingItem])
        // setRightItems(prev => prev.filter(q => q.id !== movingItem.id))
        setHighlightedIds(prev => new Set(prev.add(movingItem.id)))
        setMovedFromRightIds(prev => new Set(prev.add(movingItem.id)))
        setTimeout(() => {
          const el = document.getElementById(`table1-item-${movingItem.id}`)
          el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }, 0)
      } else if (fromContainer === 'left' && toContainer === 'right') {
        // setRightItems(prev => [...prev, movingItem])
      }
    }
  }

  // TODO: Initialize state for the selected questions
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([])

  /**
   * Handles the toggle checkbox event.
   *
   * @author Hien
   * @param {number} questionId - The ID of the question to toggle.
   */
  function handleToggleCheckbox (questionId: number) {
    // TODO: Toggle the selected right ID in the selected right IDs set
    setSelectedRightIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(questionId)) {
        newSet.delete(questionId)
      } else {
        newSet.add(questionId)
      }
      return newSet
    })

    // TODO: Toggle the selected question in the selected questions array
    setSelectedQuestions(prev => {
      const question = rightItems.find(q => q.id === questionId)
      if (!question) return prev

      const exists = prev.some(q => q.id === questionId)
      if (exists) {
        return prev.filter(q => q.id !== questionId)
      } else {
        return [...prev, question]
      }
    })
  }

  /**
   * Moves the selected items from the right table to the left table.
   *
   * @author Hien
   */
  function moveSelectedItems () {
    setLeftItems(prev => [...prev, ...selectedQuestions])
    // setRightItems(prev => prev.filter(q => !selectedRightIds.has(q.id)))

    setHighlightedIds(prev => {
      const newSet = new Set(prev)
      selectedQuestions.forEach(q => newSet.add(q.id))
      return newSet
    })

    setMovedFromRightIds(prev => {
      const newSet = new Set(prev)
      selectedQuestions.forEach(q => newSet.add(q.id))
      return newSet
    })

    if (selectedQuestions.length > 0) {
      setTimeout(() => {
        const el = document.getElementById(`table1-item-${selectedQuestions[0].id}`)
        el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }, 0)
    }

    setSelectedRightIds(new Set())
    setSelectedQuestions([])
  }

  const leftIds = leftItems.map(q => `left-${q.id}`)
  const rightIds = rightItems.map(q => `right-${q.id}`)
  const modifiers: Modifiers = isDraggingLeft ? [restrictToParentElement] : []
  /**
   * Removes the highlight from a question.
   *
   * @author Hien
   * @param {number} questionId - The ID of the question to remove the highlight from.
   */
  function removeHighlight (questionId: number) {
    setHighlightedIds(prev => {
      const newSet = new Set(prev)
      newSet.delete(questionId)
      return newSet
    })
  }
  /**
   * Handles the page change event.
   *
   * @author Hien
   * @param {number} newPage - The new page number.
   */
  const handlePageChange = (newPage: number) => {
    if (newPage < 0 || newPage >= rightPagination.totalPages) return
    fetchRightQuestions(newPage)
  }

  /**
   * Handles the save event.
   *
   * @author Hien
   * @async
   */
  const handleSave = async () => {
    const leftQuestionIds = Array.from(movedFromRightIds).map(id => id.toString())
    if (leftQuestionIds.length === 0) {
      toast.warning(t('exam_admin.dual_table_drag_modal.no_changes_made'))
      return
    }
    const orderData = leftItems.map((q, index) => ({
      questionId: q.id.toString(),
      order: index + 1
    }))
    try {
      await duplicateUpdateOrder(examId, { leftQuestionIds, orderData })
      toast.success(t('exam_admin.dual_table_drag_modal.toast.update_success'))
      onClose()
      onSuccess()
    } catch (error: any) {
      toast.success(t('exam_admin.dual_table_drag_modal.toast.update_success'))
    }
  }
  const questionTypeOptions = [
    { value: 'SINGLE_CHOICE', label: 'Một đáp án' },
    { value: 'MULTIPLE_CHOICE', label: 'Nhiều đáp án' }
  ]

  const examUsageOptions = [
    { value: 'USED', label: 'Đã sử dụng' },
    { value: 'NOT_USED', label: 'Chưa sử dụng' }
  ]
  function customStyles (arg0: boolean): StylesConfig<{ value: string | number, label: string }, false, import('react-select').GroupBase<{ value: string | number, label: string }>> | undefined {
    return {
      control: (provided, state) => ({
        ...provided,
        width: 280,
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
      <div className="bg-white rounded-lg w-11/12 max-w-8xl p-4 space-y-4">
        <div className="flex justify-between items-center border-b pb-3">
          <div></div>
          <h2 className="text-2xl font-bold">{t('exam_admin.dual_table_drag_modal.title')}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} modifiers={modifiers}>
          <div className="flex space-x-4 h-[80vh]">
            {/* Table 1 */}
            <LeftDropZone>
            {loading
              ? (
                    <div className="flex justify-center items-center h-full">
                        <ClipLoader color="#5EEAD4" loading={loading} size={40} />
                    </div>
                )
              : leftItems.length === 0
                ? (
              <div className="flex h-full items-center justify-center text-gray-500">
                {t('exam_admin.dual_table_drag_modal.no_question_exam')}
              </div>
                  )
                : (
              <SortableContext items={leftIds} strategy={verticalListSortingStrategy}>
                {leftItems.map((question, index) => (
                  <SortableItem
                    key={`left-${question.id}`}
                    containerId="left"
                    index={index}
                    question={question}
                    highlight={highlightedIds.has(question.id)}
                    onRemoveHighlight={removeHighlight}
                  />
                ))}
              </SortableContext>
                  )}
            </LeftDropZone>
            {/* Button move */}
            <div className="flex flex-col justify-center">
              <Button variant="contained" onClick={moveSelectedItems} disabled={selectedRightIds.size === 0}>
                <KeyboardBackspaceIcon />
              </Button>
            </div>
            {/* Talbe 2 */}
            <div className="w-1/2 border p-2 overflow-y-auto transition-all duration-500 flex flex-col">
              <div className="flex justify-between items-center relative mb-2">
                <div className="flex items-center flex-wrap gap-2 mb-2 relative">
                  {/* Button toggle filter */}
                  <button
                    className="hover:bg-gray-200 text-green-500 font-bold py-0.5 px-2 rounded border border-green-500 bg-white"
                    onClick={() => setOpenFilter(prev => !prev)}
                  >
                    {t('question_bank_admin.filter')}
                    <FilterAltTwoToneIcon className="ml-1" />
                  </button>
              <div className="ml-2 flex flex-wrap">
                {filterCourseId && (
                  <div className="ml-2 flex items-center bg-green-100 text-green-700 px-2 py-1 rounded">
                    {coursesList.find((c) => c.id === Number(filterCourseId))?.name || t('exam_admin.dual_table_drag_modal.all')}
                    <button
                      onClick={() => {
                        setFilterCourseId('')
                        setTempFilterCourseId('')
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
                {filterGroupId && (
                  <div className="ml-2 flex items-center bg-green-100 text-green-700 px-2 py-1 rounded">
                    {groupsList.find((g) => g.id === Number(filterGroupId))?.name || t('exam_admin.dual_table_drag_modal.all')}
                    <button
                      onClick={() => {
                        setFilterGroupId('')
                        setTempFilterGroupId('')
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
                {questionTypeFilter && (
                  <div className="ml-2 flex items-center bg-green-100 text-green-700 px-2 py-1 rounded">
                    {t(`question_bank_admin.${questionTypeOptions.find((opt) => opt.value === questionTypeFilter)?.value === 'SINGLE_CHOICE' ? 'single_choice' : 'multiple_choice'}`)}
                    <button
                      onClick={() => {
                        setQuestionTypeFilter('')
                        setTempQuestionTypeFilter('')
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
                        setTempExamUsageFilter('')
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
              </div>
              </div>
              {/* Filter panel */}
              {openFilter && (
                <div className="absolute z-10 mt-10 bg-white border border-gray-300 shadow-lg p-4 w-120">
                  {examDetail?.courseId && (
                    <div className="mb-4 flex items-center">
                      <label className="w-40 mb-2 text-base">
                        {t('exam_admin.dual_table_drag_modal.course_filter')}:
                      </label>
                      <Select
                        isDisabled={coursesLoading}
                        options={[
                          { value: 'ALL', label: t('exam_admin.dual_table_drag_modal.all') ?? 'Tất cả' },
                          ...coursesList.map(c => ({ value: c.id, label: c.name }))
                        ]}
                        value={
                          tempFilterCourseId !== ''
                            ? {
                                value: tempFilterCourseId,
                                label:
                                String(tempFilterCourseId) === 'ALL'
                                  ? t('exam_admin.dual_table_drag_modal.all') ?? 'Tất cả'
                                  : coursesList.find(c => c.id === Number(tempFilterCourseId))?.name || ''
                              }
                            : null
                        }

                        onChange={(opt: SingleValue<{ value: number | string, label: string }>) => {
                          setTempFilterCourseId(opt ? (opt.value as number) : '')
                        }}
                        isClearable={true}
                        styles={customStyles(false)}
                        placeholder={t('exam_admin.dual_table_drag_modal.course_filter')}
                      />
                    </div>
                  )}

                  {examDetail?.groupId && (
                    <div className="mb-4 flex items-center">
                      <label className="w-40 mb-2 text-base">
                        {t('exam_admin.dual_table_drag_modal.group_filter')}:
                      </label>
                      <Select
                        isDisabled={groupsLoading}
                        options={[
                          { value: 'ALL', label: t('exam_admin.dual_table_drag_modal.all') ?? 'Tất cả' },
                          ...groupsList.map(g => ({ value: g.id, label: g.name }))
                        ]}
                        value={
                          tempFilterGroupId !== ''
                            ? {
                                value: tempFilterGroupId,
                                label:
                                String(tempFilterGroupId) === 'ALL'
                                  ? t('exam_admin.dual_table_drag_modal.all') ?? 'Tất cả'
                                  : groupsList.find(g => g.id === Number(tempFilterGroupId))?.name || ''
                              }
                            : null
                        }
                        onChange={(opt: SingleValue<{ value: number | string, label: string }>) => {
                          setTempFilterGroupId(opt ? (opt.value as number) : '')
                        }}
                        isClearable={true}
                        styles={customStyles(false)}
                        placeholder={t('exam_admin.dual_table_drag_modal.group_filter')}
                      />
                    </div>
                  )}
                  <div className="mb-4 flex items-center">
                    <label className="w-40 mb-2">{t('question_bank_admin.question_type')}:</label>
                    <Select
                      options={questionTypeOptions}
                      value={
                        questionTypeOptions.find((opt) => opt.value === tempQuestionTypeFilter) || null
                      }
                      onChange={(selectedOption) => {
                        setTempQuestionTypeFilter(String(selectedOption?.value ?? ''))
                      }}
                      isClearable={isClearable}
                      styles={customStyles(false)}
                      className="flex-1"
                      placeholder={t('question_bank_admin.question_type')}
                      formatOptionLabel={(option) => t(`question_bank_admin.${option.value === 'SINGLE_CHOICE' ? 'single_choice' : 'multiple_choice'}`)}
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
                        setTempExamUsageFilter(String(selectedOption?.value ?? ''))
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
                      setFilterCourseId(tempFilterCourseId)
                      setFilterGroupId(tempFilterGroupId)
                      setQuestionTypeFilter(tempQuestionTypeFilter)
                      setExamUsageFilter(tempExamUsageFilter)
                      setPagination(prev => ({ ...prev, pageIndex: 0 }))
                      void fetchRightQuestions(0, {
                        filterOption: (tempFilterCourseId === '' && tempFilterGroupId === '') ? 'ALL' : undefined
                      })
                      setOpenFilter(false)
                    }}
                  >
                    {t('question_bank_admin.apply')}
                  </button>
                </div>
              )}

              {/* Header */}
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-center font-semibold">{t('exam_admin.dual_table_drag_modal.question_list_bank')}</h3>
              </div>
              {/* Search box */}
              <div className="mb-2 flex items-center">
                <TextField
                  size="small"
                  variant="outlined"
                  placeholder={t('exam_admin.dual_table_drag_modal.search_question') || 'Tìm kiếm câu hỏi...'}
                  value={pendingKeyword}
                  onChange={e => setPendingKeyword(e.target.value)}
                  fullWidth
                />
                <Button
                  variant="contained"
                  size="small"
                  style={{
                    minWidth: 75,
                    width: 75,
                    height: 42,
                    marginLeft: 8,
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onClick={() => setSearchKeyword(pendingKeyword)}
                >
                  <SearchIcon />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-grow overflow-y-auto">
                {listLoading
                  ? (
                    <div className="flex justify-center items-center h-full">
                        <ClipLoader color="#5EEAD4" loading={listLoading} size={40} />
                    </div>
                    )
                  : rightItems.length === 0
                    ? (
                    <div className="flex h-full items-center justify-center text-gray-500">
                      {t('exam_admin.dual_table_drag_modal.no_question_bank')}
                    </div>
                      )
                    : (
                    <SortableContext items={rightIds} strategy={verticalListSortingStrategy}>
                      {rightItems.map((question, index) => {
                        const isDisabled = leftItems.some(q => q.id === question.id)
                        const globalIndex = rightPagination.currentPage * rightPagination.pageSize + index
                        return (
                          <SortableItem
                            key={`right-${question.id}`}
                            containerId="right"
                            question={question}
                            index={globalIndex}
                            disabled={isDisabled}
                            showCheckbox={!isDisabled}
                            checked={selectedRightIds.has(question.id)}
                            onToggleCheckbox={handleToggleCheckbox}
                          />
                        )
                      })}
                    </SortableContext>
                      )}
              </div>

              {/* Footer */}
              {rightPagination.totalPages > 0 && (
                <div className="flex justify-center mt-4">
                  <Pagination
                    count={rightPagination.totalPages}
                    page={rightPagination.currentPage + 1}
                    onChange={(_, value) => handlePageChange(value - 1)}
                    showFirstButton
                    showLastButton
                  />
                </div>
              )}
            </div>
          </div>
          <DragOverlay>
            {activeQuestion && (
              <div className="bg-gray-50 border border-gray-200 rounded-md p-3 flex cursor-default" style={{ backgroundColor: '#EFF6FF' }}>
                <div className="flex flex-col items-center">
                  <DragHandleIcon className="h-5 w-5 text-gray-500 cursor-move" />
                </div>
                <div className="flex-1 ml-3">
                  <div className="flex items-center">
                  {activeId?.startsWith('left')
                    ? (
                    <span className="font-bold">
                      {t('exam_admin.dual_table_drag_modal.question')} {leftItems.findIndex(q => q.id.toString() === activeQuestion.id.toString()) + 1}:
                    </span>
                      )
                    : (
                    <span className="font-bold">
                      {t('exam_admin.dual_table_drag_modal.question')} {(() => {
                        const questionIndex = rightItems.findIndex(q => q.id === activeQuestion.id)
                        const globalIndex = rightPagination.currentPage * rightPagination.pageSize + questionIndex
                        return activeQuestion.originalIndex !== undefined
                          ? activeQuestion.originalIndex + 1
                          : globalIndex + 1
                      })()}:
                    </span>
                      )}
                  </div>
                  <div>
                    <QuillShow htmlContent={activeQuestion.content || ''} />
                  </div>
                </div>
              </div>
            )}
          </DragOverlay>
        </DndContext>
        <div className="flex justify-end space-x-2 border-t pt-3">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2 hover:bg-gray-400 hover:text-black"
          >
            {t('exam_admin.dual_table_drag_modal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
          >
            {t('exam_admin.dual_table_drag_modal.save_changes')}
          </button>
        </div>
      </div>
    </div>
  )
}
