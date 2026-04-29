/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: SortQuestionModal
========================================================================= */
import React, { useState, useEffect } from 'react'
import DragHandleIcon from '@mui/icons-material/DragHandle'
import { DndContext, closestCenter, DragEndEvent, DragOverlay } from '@dnd-kit/core'
import { restrictToVerticalAxis, restrictToParentElement } from '@dnd-kit/modifiers'
import { updateQuestionOrder, getQuestionExam } from '../../../api/post/post.api'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { ClipLoader } from 'react-spinners'
import ExpandLessIcon from '@mui/icons-material/ExpandLess'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { Question } from '../../../api/post/post.interface'
import { useTranslation } from 'react-i18next'
import QuillShow from '../../../components/QuillEditor'

import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { toast } from 'react-toastify'

interface SortQuestionModalProps {
  onClose: () => void
  onSuccess: () => void
  examId: number
}

interface SortableItemProps {
  item: Question
  index: number
}

/**
 * Removes images from HTML content.
 *
 * @author Hien
 * @param {string} html - The HTML content.
 * @returns {string} The HTML content without images.
 */
const removeImagesFromHtml = (html: string): string => {
  return html.replace(/<img[^>]*>/gi, '')
}

/**
 * SortableItem component for rendering a sortable item.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered SortableItem component.
 */
const SortableItem: React.FC<SortableItemProps> = ({ item, index }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize the useSortable hook
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  // TODO: Initialize state for the show details flag
  const [showDetails, setShowDetails] = useState(false)
  // TODO: Define the style for the item
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0 : 1
    // border: isDragging ? '2px dashed #ccc' : 'none',
    // opacity: isDragging ? 0.5 : 1
  }

  /**
   * Renders the content of the item.
   *
   * @author Hien
   * @returns {JSX.Element} The rendered content.
   */
  const renderContent = () => {
    if (showDetails) {
      return <div><QuillShow htmlContent={item.content || ''} /></div>
    } else {
      return <div><QuillShow htmlContent={removeImagesFromHtml(item.content || '')} /></div>
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-gray-50 border border-gray-200 rounded-md p-3 flex flex-col cursor-default mb-2"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <DragHandleIcon className="h-5 w-5 text-gray-500 cursor-pointer" />
          <span className="font-bold">{t('exam_admin.sort_question_modal.question')} {index + 1}:</span>
        </div>
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
      <div className="ml-7">
        {item && renderContent()}
        {showDetails && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <div>
              <strong>{t('exam_admin.sort_question_modal.question_type')}:</strong> {(item.type === 'SINGLE_CHOICE' ? t('exam_admin.sort_question_modal.single_answer') : t('exam_admin.sort_question_modal.multiple_answers'))}
            </div>
            <div>
              <strong>{t('exam_admin.sort_question_modal.answer_instruction')}: </strong>{' '}
              <QuillShow htmlContent={item.instruction || ''} />
            </div>
            {item.answers && item.answers.length > 0 && (
              <div className="my-2">
                <ul>
                  {item.answers.map((ans, i) => (
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
              <strong>{t('exam_admin.sort_question_modal.correct_answer_explanation')}:</strong>{' '}
              <QuillShow htmlContent={item.explanation || ''} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
/**
 * SortQuestionModal component for sorting questions in an exam.
 *
 * @author Hien
 * @component
 * @param {object} props - The component props.
 * @returns {JSX.Element} The rendered SortQuestionModal component.
 */
const SortQuestionModal: React.FC<SortQuestionModalProps> = ({ onClose, onSuccess, examId }) => {
  // TODO: Initialize the translation hook
  const { t } = useTranslation()
  // TODO: Initialize state for the items
  const [items, setItems] = useState<Question[]>([])
  // TODO: Initialize state for the active ID
  const [activeId, setActiveId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const fetchAllQuestions = async () => {
      try {
        setLoading(true)
        const res = await getQuestionExam(examId)
        const data = res.data
        const formattedQuestions = data.map((question: any) => {
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
            explanation: question.explanation
          }
        })
        setItems(formattedQuestions)
      } catch (error) {
        console.error('Error fetching questions for sorting:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAllQuestions()
  }, [examId])

  /**
   * Handles the drag start event.
   *
   * @author Hien
   * @param {any} event - The drag start event.
   */
  const handleDragStart = (event: any) => {
    setActiveId(event.active.id)
  }

  /**
   * Handles the drag end event.
   *
   * @author Hien
   * @param {DragEndEvent} event - The drag end event.
   */
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    if (!over || active.id === over.id) return

    const oldIndex = items.findIndex(item => item.id === active.id)
    const newIndex = items.findIndex(item => item.id === over.id)
    const newItems = arrayMove(items, oldIndex, newIndex)
    setItems(newItems)
  }

  const activeItem = items.find(item => item.id === activeId)

  /**
   * Handles the save event.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSave = async () => {
    try {
      await updateQuestionOrder(
        examId,
        items.map((item, index) => ({
          questionId: item.id,
          order: index
        }))
      )
      onSuccess()
      onClose()
    } catch (error) {
      toast.error(t('exam_admin.sort_question_modal.toast.update_order_failed'))
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative bg-white rounded-xl shadow-2xl w-4/5 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div></div>
          <h2 className="text-2xl font-semibold text-gray-800">{t('exam_admin.sort_question_modal.title')}</h2>
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

        {/* Drag and drop area */}
        <div className="p-4 h-[80vh] overflow-y-auto relative">
        {/* TODO: Show a message if there are no questions to sort */}
          {loading
            ? (
            <div className="flex justify-center items-center h-[60vh]">
              <ClipLoader color="#5EEAD4" loading={loading} size={40} />
            </div>
              )
            : items.length === 0
              ? (
            <div className="flex h-full items-center justify-center text-gray-500">
              {t('exam_admin.sort_question_modal.no_question_to_sort')}
            </div>
                )
              : (
          <DndContext
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            modifiers={[restrictToVerticalAxis, restrictToParentElement]}
          >
            <SortableContext items={items.map(item => item.id)} strategy={verticalListSortingStrategy}>
            <div style={{ backgroundColor: activeId ? '#f0f0f0' : 'transparent' }}>
                {items.map((item, index) => (
                  <SortableItem key={item.id} item={item} index={index} />
                ))}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeItem
                ? (
                  <div
                    style={{ backgroundColor: '#EFF6FF' }}
                    className="bg-gray-50 border border-gray-200 rounded-md p-3 flex flex-col"
                  >
                    <div className="flex items-center space-x-2">
                      <DragHandleIcon className="h-5 w-5 text-gray-500 cursor-move" />
                      <span className="font-bold">{t('exam_admin.sort_question_modal.question')} {items.indexOf(activeItem) + 1}:</span>
                    </div>
                    <div className="ml-7">
                      {activeItem && (
                        <div><QuillShow htmlContent={removeImagesFromHtml(activeItem.content || '')} /></div>
                      )}
                    </div>
                  </div>
                  )
                : null}
            </DragOverlay>
          </DndContext>
                )}
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t space-x-2">
          <button
            onClick={onClose}
            className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2 hover:bg-gray-400 hover:text-black"
          >
            {t('exam_admin.sort_question_modal.cancel')}
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
          >
            {t('exam_admin.sort_question_modal.save_changes')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SortQuestionModal
