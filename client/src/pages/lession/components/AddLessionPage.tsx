/* eslint-disable no-useless-escape */
/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable multiline-ternary */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* PAGE: AddLession
========================================================================== */
import React, { useEffect, useRef, useState } from 'react'
import Select, { SingleValue } from 'react-select'
import { getCourseLession, getCategoryLessionsByCourseId, createLession, updateLession, uploadFileInChunks } from 'api/post/post.api'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { getFromLocalStorage } from 'utils/functions'
import { PacmanLoader } from 'react-spinners'
import { useTranslation } from 'react-i18next'
// import { FileUploader } from 'react-drag-drop-files'
import { FileRejection, ErrorCode as DropzoneErrorCode, Accept } from 'react-dropzone'
import { toast } from 'react-toastify'
import { Controller, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  getBase64,
  getVideoCover
} from '../../../utils/fileconfig'
import PreviewFiles from '../../../components/PreviewFiles'
import UploadFiles from '../../../components/UploadFiles'
import { IUploadFile } from '../../../api/interfaces'
interface OptionType {
  value: string
  label: string | undefined
}
interface IForm {
  files: IUploadFile[]
}

const MAX_FILE_SIZE = 1024 * 1024 * 10
const MAX_NUMER_OF_FILES = 1

/**
 * Form validation schema
 *
 * @author Hien
 * @param {zod.object} FormValidationSchema
 */
const FormValidationSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, 'Vui lòng chọn file!')
})

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
    borderColor: isError ? 'red' : state.isFocused ? 'teal' : provided.borderColor,
    boxShadow: isError ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px teal' : provided.boxShadow,
    '&:hover': {
      borderColor: isError ? 'red' : state.isFocused ? 'teal' : provided['&:hover'].borderColor
    }
  })
})

interface FormInput {
  id: string
  name: string
  description: string
  content: string
  type: string
  order: string
  locationPath: string
}
interface Course {
  id: string
  name: string
}

interface CategoryLesson {
  id: string
  name: string
}

const lessonTypes = [
  { value: 'PDF', label: 'PDF' },
  { value: 'DOC', label: 'DOC' },
  { value: 'MP4', label: 'MP4' }
]

const PdfIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="50px" height="50" viewBox="0 0 56 64" enableBackground="new 0 0 56 64" xmlSpace="preserve">
    <g>
      <path fill="#8C181A" d="M5.1,0C2.3,0,0,2.3,0,5.1v53.8C0,61.7,2.3,64,5.1,64h45.8c2.8,0,5.1-2.3,5.1-5.1V20.3L37.1,0H5.1z" /><path fill="#6B0D12" d="M56,20.4v1H43.2c0,0-6.3-1.3-6.1-6.7c0,0,0.2,5.7,6,5.7H56z" /><path opacity="0.5" fill="#FFFFFF" enableBackground="new" d="M37.1,0v14.6c0,1.7,1.1,5.8,6.1,5.8H56L37.1,0z" />
    </g>
    <path fill="#FFFFFF" d="M14.9,49h-3.3v4.1c0,0.4-0.3,0.7-0.8,0.7c-0.4,0-0.7-0.3-0.7-0.7V42.9c0-0.6,0.5-1.1,1.1-1.1h3.7  c2.4,0,3.8,1.7,3.8,3.6C18.7,47.4,17.3,49,14.9,49z M14.8,43.1h-3.2v4.6h3.2c1.4,0,2.4-0.9,2.4-2.3C17.2,44,16.2,43.1,14.8,43.1z   M25.2,53.8h-3c-0.6,0-1.1-0.5-1.1-1.1v-9.8c0-0.6,0.5-1.1,1.1-1.1h3c3.7,0,6.2,2.6,6.2,6C31.4,51.2,29,53.8,25.2,53.8z M25.2,43.1  h-2.6v9.3h2.6c2.9,0,4.6-2.1,4.6-4.7C29.9,45.2,28.2,43.1,25.2,43.1z M41.5,43.1h-5.8V47h5.7c0.4,0,0.6,0.3,0.6,0.7  s-0.3,0.6-0.6,0.6h-5.7v4.8c0,0.4-0.3,0.7-0.8,0.7c-0.4,0-0.7-0.3-0.7-0.7V42.9c0-0.6,0.5-1.1,1.1-1.1h6.2c0.4,0,0.6,0.3,0.6,0.7  C42.2,42.8,41.9,43.1,41.5,43.1z" />
  </svg>
)
const WordIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="-4 0 64 64">
    <g fillRule="evenodd">
      <path d="m5.11 0a5.07 5.07 0 0 0 -5.11 5v53.88a5.07 5.07 0 0 0 5.11 5.12h45.78a5.07 5.07 0 0 0 5.11-5.12v-38.6l-18.94-20.28z" fill="#107cad" />
      <path d="m56 20.35v1h-12.82s-6.31-1.26-6.13-6.71c0 0 .21 5.71 6 5.71z" fill="#084968" />
      <path d="m37.07 0v14.56a5.78 5.78 0 0 0 6.11 5.79h12.82z" fill="#90d0fe" opacity=".5" />
    </g>
    <path d="m14.24 53.86h-3a1.08 1.08 0 0 1 -1.08-1.08v-9.85a1.08 1.08 0 0 1 1.08-1.08h3a6 6 0 1 1 0 12zm0-10.67h-2.61v9.34h2.61a4.41 4.41 0 0 0 4.61-4.66 4.38 4.38 0 0 0 -4.61-4.68zm14.42 10.89a5.86 5.86 0 0 1 -6-6.21 6 6 0 1 1 11.92 0 5.87 5.87 0 0 1 -5.92 6.21zm0-11.09c-2.7 0-4.41 2.07-4.41 4.88s1.71 4.88 4.41 4.88 4.41-2.09 4.41-4.88-1.72-4.87-4.41-4.87zm18.45.38a.75.75 0 0 1 .2.52.71.71 0 0 1 -.7.72.64.64 0 0 1 -.51-.24 4.06 4.06 0 0 0 -3-1.38 4.61 4.61 0 0 0 -4.63 4.88 4.63 4.63 0 0 0 4.63 4.88 4 4 0 0 0 3-1.37.7.7 0 0 1 .51-.24.72.72 0 0 1 .7.74.78.78 0 0 1 -.2.51 5.33 5.33 0 0 1 -4 1.69 6.22 6.22 0 0 1 0-12.43 5.26 5.26 0 0 1 4 1.72z" fill="#ffffff" />
  </svg>
)
const DefaultIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" viewBox="-4 0 64 64">
    <g fillRule="evenodd" clipRule="evenodd">
      <path d="M5.113.007c-2.803 0-5.074 2.271-5.074 5.074v53.84c0 2.803 2.271 5.074 5.074 5.074h45.774c2.801 0 5.074-2.271 5.074-5.074v-38.606l-18.903-20.308h-31.945z" fill="#8199AF" />
      <path d="M55.976 20.352v1h-12.799s-6.312-1.26-6.129-6.707c0 0 .208 5.707 6.004 5.707h12.924z" fill="#617F9B" />
      <path d="M37.074 0v14.561c0 1.656 1.104 5.791 6.104 5.791h12.799l-18.903-20.352z" opacity=".5" fill="#ffffff" />
    </g>
  </svg>
)

/**
 * Get file icon by file name
 *
 * @author Hien
 * @param {string} fileName
 * @returns {JSX.Element}
 */
const getFileIcon = (fileName: string) => {
  const extension = fileName.split('.').pop()
  switch (extension) {
    case 'pdf':
      return <PdfIcon />
    case 'doc':
    case 'docx':
      return <WordIcon />
    default:
      return <DefaultIcon />
  }
}

/**
 * AddLession component handles the addition and editing of lessons.
 *
 * @author Hien
 * @component
 * @param {object} props - The props of the component.
 * @returns {JSX.Element} The rendered AddLession component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {boolean} isLoading - The state for managing loading state.
 * @property {object} tokens - The state for storing user tokens.
 * @property {string} userId - The ID of the current user.
 * @property {string} mode - The mode of the component, either 'edit' or 'add'.
 * @property {object} lession - The lesson data from location state.
 * @property {string} selectedCourse - The selected course ID.
 * @property {string} selectedCategoryLesson - The selected category lesson ID.
 * @property {string} selectedLessonType - The selected lesson type.
 * @property {File | null} uploadedFile - The uploaded file.
 * @property {string | null} existingFile - The existing file path.
 * @property {string | null} uploadedFileName - The uploaded file name.
 * @property {boolean} isMounted - The ref to track component mount state.
 * @property {object} formInput - The state for managing form input values.
 * @property {object} objCheckInput - The state for managing input validation.
 * @property {boolean} isValidFile - The state for managing file validation.
 */
const AddLession: React.FC = (props) => {
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [notify, setNotify] = useState<boolean>(false)
  const [allowDownload, setAllowDownload] = useState<boolean>(false)
  const [tokens, setTokens] = useState(getFromLocalStorage<any>('tokens'))
  const userId = tokens?.id
  // Update tokens on storage change
  useEffect(() => {
    const handleStorageChange = () => {
      setTokens(getFromLocalStorage<any>('tokens'))
    }
    window.addEventListener('storage', handleStorageChange)
    return () => {
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])
  const { id } = useParams<{ id: string }>()
  const location = useLocation()
  const navigate = useNavigate()

  const mode = id ? 'edit' : 'add'
  const lession = location.state?.lession
  const { selectedCourse: initialSelectedCourse, selectedCategoryLesson: initialSelectedCategoryLessonFromLocation } = location.state || {}
  const [courses, setCourses] = useState<Course[]>([])
  const [selectedCourse, setSelectedCourse] = useState<string>(initialSelectedCourse || '')
  const [categoryLessons, setCategoryLessons] = useState<CategoryLesson[]>([])
  const [initialSelectedCategoryLesson, setInitialSelectedCategoryLesson] = useState<string>(initialSelectedCategoryLessonFromLocation || '')
  const [selectedCategoryLesson, setSelectedCategoryLesson] = useState<string>(initialSelectedCategoryLessonFromLocation || '')

  const [selectedLessonType, setSelectedLessonType] = useState<string>('')
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [existingFile, setExistingFile] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)

  const isMounted = useRef(true)

  // Track component mount state
  useEffect(() => {
    return () => {
      isMounted.current = false
    }
  }, [])

  // Set initial values for edit mode
  useEffect(() => {
    if (mode === 'edit' && lession === undefined) {
      navigate('/lesson')
    } else if (mode === 'edit' && lession) {
      const currentAllowDownload = Boolean(lession.allowDownload ?? lession.allow_download)
      setFormInput({
        id: lession.id.toString(),
        name: lession.name,
        description: lession.description,
        content: lession.content,
        type: lession.type,
        order: lession.order.toString(),
        locationPath: lession.locationPath
      })
      setSelectedLessonType(lession.type)
      setAllowDownload(lession.type === 'PDF' ? currentAllowDownload : false)
      if (lession.type === 'MP4') {
        setExistingFile(null)
      } else {
        setExistingFile(lession.locationPath)
        formInput.locationPath = ''
        setFormInput({ ...formInput, locationPath: '', id: lession.id, name: lession.name, description: lession.description, content: lession.content, order: lession.order.toString() })
      }
    }
  }, [mode, lession, navigate])

  // Fetch courses on component mount
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await getCourseLession()
        const courses = response.data
        setCourses(courses)
        if (courses.length > 0 && !initialSelectedCourse) {
          const maxCourseId = courses.reduce((max: string, course: Course) => (course.id > max ? course.id : max), courses[0].id)
          setSelectedCourse(maxCourseId)
        }
      } catch (error) {
        // toast.error(t('lesson.toast.failed_to_fetch_courses'))
      }
    }
    fetchCourses()
  }, [])

  // Fetch category lessons based on selected course
  useEffect(() => {
    if (selectedCourse !== '') {
      const fetchCategoryLessons = async () => {
        try {
          const response = await getCategoryLessionsByCourseId({ courseId: selectedCourse })
          const categoryLessons = response.data
          setCategoryLessons(categoryLessons)
          if (categoryLessons.length > 0 && !initialSelectedCategoryLesson) {
            const minCategoryLessonId = categoryLessons.reduce((min: string, categoryLesson: CategoryLesson) => (categoryLesson.id < min ? categoryLesson.id : min), categoryLessons[0].id)
            setSelectedCategoryLesson(minCategoryLessonId)
          }
        } catch (error) {
          // toast.error(t('lesson.toast.failed_to_fetch_category_lessons'))
        }
      }
      fetchCategoryLessons()
    }
  }, [selectedCourse])

  // Reset initial selected category lesson on course change
  useEffect(() => {
    setInitialSelectedCategoryLesson('')
  }, [selectedCourse])

  const [originalLessonType, setOriginalLessonType] = useState('')

  // Set original lesson type on lesson change
  useEffect(() => {
    if (lession) {
      setOriginalLessonType(lession.type)
    }
  }, [lession])

  const [formInput, setFormInput] = useState<FormInput>({
    id: '',
    name: '',
    description: '',
    content: '',
    type: '',
    order: '',
    locationPath: ''
  })

  const defaultObjCheckInput = {
    isValidName: true,
    isValidDescription: true,
    isValidContent: true,
    isValidType: true,
    isValidOrder: true,
    isValidLocationPath: true
  }
  const [objCheckInput, setObjCheckInput] = useState(defaultObjCheckInput)
  const nameRef = useRef<any>(null)
  const descriptionRef = useRef<any>(null)
  const contentRef = useRef<any>(null)
  const lessonTypeRef = useRef<any>(null)
  const LocationPathRef = useRef<any>(null)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [errorField, setErrorField] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isValidFile, setIsValidFile] = useState(true)

  /**
   * Validates form inputs.
   *
   * @author Hien
   * @returns {boolean} True if inputs are valid, false otherwise.
   */
  const isValidInputs = () => {
    setObjCheckInput(defaultObjCheckInput)
    setIsValidFile(true)

    if (formInput.name === '' || formInput.name === null) {
      toast.error(t('lesson.toast.name_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
      if (nameRef.current) {
        nameRef.current.focus()
      }
      return false
    }
    if (formInput.description === '' || formInput.description === null) {
      toast.error(t('lesson.toast.description_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidDescription: false })
      if (descriptionRef.current) {
        descriptionRef.current.focus()
      }
      return false
    }
    if (formInput.content === '' || formInput.content === null) {
      toast.error(t('lesson.toast.content_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidContent: false })
      if (contentRef.current) {
        contentRef.current.focus()
      }
      return false
    }
    if (selectedLessonType === '' || selectedLessonType === null) {
      toast.error(t('lesson.toast.lesson_type_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidType: false })
      if (lessonTypeRef.current) {
        lessonTypeRef.current.focus()
      }
      return false
    }
    if (selectedLessonType === 'MP4' && (formInput.locationPath === '' || formInput.locationPath === null)) {
      toast.error(t('lesson.toast.location_path_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidLocationPath: false })
      if (LocationPathRef.current) {
        LocationPathRef.current.focus()
      }
      return false
    }
    if (selectedLessonType !== 'MP4' && !uploadedFile && !existingFile) {
      toast.error(t('lesson.toast.file_is_required'))
      setIsValidFile(false)
      document.getElementById('file')?.focus()
      return false
    }
    if (mode === 'edit' && selectedLessonType !== 'MP4' && selectedLessonType !== originalLessonType && !uploadedFile) {
      toast.error(t('lesson.toast.lesson_type_cannot_be_changed'))
      setIsValidFile(false)
      document.getElementById('file')?.focus()
      return false
    }
    return true
  }

  /**
   * Handles saving changes for adding a lesson.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSaveChanges = async () => {
    try {
      setIsLoading(true)
      if (isValidInputs()) {
        if (selectedLessonType !== 'MP4') {
          if (!uploadedFile && !existingFile) {
            toast.error(t('lesson.toast.file_is_required'))
            return
          }
          const allowedFileTypes: Record<string, string[]> = {
            PDF: ['application/pdf'],
            DOC: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          }
          const fileType = uploadedFile?.type
          if (fileType && !allowedFileTypes[selectedLessonType].includes(fileType)) {
            toast.error(t('lesson.toast.invalid_file_type'))
            return
          }
        }

        const payload = {
          lessionCategoryId: selectedCategoryLesson,
          name: formInput.name,
          description: formInput.description,
          content: formInput.content,
          type: selectedLessonType,
          order: formInput.order,
          locationPath: formInput.locationPath,
          allowDownload: selectedLessonType === 'PDF' && allowDownload,
          uploadedBy: userId,
          notify
        }
        if (selectedLessonType !== 'MP4' && uploadedFile) {
          const uploadResponse = await uploadFileInChunks(uploadedFile)
          payload.locationPath = uploadResponse.data.file
        } else if (existingFile) {
          payload.locationPath = existingFile
        }
        if (selectedLessonType === 'MP4' && formInput.locationPath) {
          const youtubeId = getYouTubeVideoId(formInput.locationPath)
          if (youtubeId) {
            payload.locationPath = youtubeId
          } else {
            toast.error(t('lesson.toast.invalid_youtube_link'))
            return
          }
        }

        const response = await createLession(payload)
        if (response.status === 200) {
          toast.success(t('lesson.toast.create_successfully'))
          navigate('/lesson', { state: { selectedCourse, selectedCategoryLesson } })
        } else {
          toast.error(t('lesson.toast.create_failed'))
        }
      }
    } catch (error: any) {
      if (error.message === 'NAME_EXIST') {
        toast.error(t('lesson.toast.duplicate_name'))
        setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
        if (nameRef.current) {
          nameRef.current.focus()
        }
      } else if (error.message === 'LOCATIONPATH_EXIST') {
        toast.error(t('lesson.toast.duplicate_location_path'))
        setObjCheckInput({ ...defaultObjCheckInput, isValidLocationPath: false })
        if (LocationPathRef.current) {
          LocationPathRef.current.focus()
        }
      } else {
        toast.error(t('lesson.toast.create_failed'))
      }
      if (error.field) {
        setErrorField(error.field)
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles canceling the addition of a lesson.
   *
   * @author Hien
   */
  const handleCancel = () => {
    setFormInput({
      id: '',
      name: '',
      description: '',
      content: '',
      type: '',
      order: '',
      locationPath: ''
    })
    setObjCheckInput(defaultObjCheckInput)
    setSelectedLessonType('')
    setAllowDownload(false)
    setUploadedFile(null)
    setExistingFile(null)
    navigate('/lesson', { state: { selectedCourse, selectedCategoryLesson } })
  }

  /**
   * Handles saving changes for editing a lesson.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSaveEdit = async () => {
    try {
      setIsLoading(true)
      if (isValidInputs()) {
        if (selectedLessonType !== 'MP4') {
          if (!uploadedFile && !existingFile) {
            toast.error(t('lesson.toast.file_is_required'))
            return
          }
          const allowedFileTypes: Record<string, string[]> = {
            PDF: ['application/pdf'],
            DOC: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
          }
          const fileType = uploadedFile?.type
          if (fileType && !allowedFileTypes[selectedLessonType].includes(fileType)) {
            toast.error(t('lesson.toast.invalid_file_type'))
            return
          }
        }

        const payload = {
          id: formInput.id,
          lessionCategoryId: selectedCategoryLesson,
          name: formInput.name,
          description: formInput.description,
          content: formInput.content,
          type: selectedLessonType,
          order: formInput.order,
          locationPath: formInput.locationPath,
          allowDownload: selectedLessonType === 'PDF' && allowDownload,
          uploadedBy: userId,
          notify
        }
        if (selectedLessonType !== 'MP4' && uploadedFile) {
          const uploadResponse = await uploadFileInChunks(uploadedFile)
          payload.locationPath = uploadResponse.data.file
        } else if (existingFile) {
          payload.locationPath = existingFile
        }
        if (selectedLessonType === 'MP4' && formInput.locationPath) {
          const youtubeId = getYouTubeVideoId(formInput.locationPath)
          if (youtubeId) {
            payload.locationPath = youtubeId
          } else {
            toast.error(t('lesson.toast.invalid_youtube_link'))
            return
          }
        }
        if (
          lession?.lessionCategoryId === selectedCategoryLesson &&
          lession?.name === payload.name &&
          lession?.description === payload.description &&
          lession?.content === payload.content &&
          lession?.type === payload.type &&
          lession?.order === +payload.order &&
          lession?.locationPath === payload.locationPath &&
          Boolean(lession?.allowDownload ?? lession?.allow_download) === payload.allowDownload
        ) {
          toast.warning(t('lesson.toast.nothing_to_update'))
          return
        }
        const response = await updateLession(payload.id, payload)
        if (response.status === 200) {
          toast.success(t('lesson.toast.update_successfully'))
          navigate('/lesson', { state: { selectedCourse, selectedCategoryLesson } })
        } else {
          toast.error(t('lesson.toast.update_failed'))
        }
      }
    } catch (error: any) {
      if (error.message === 'NAME_EXIST') {
        toast.error(t('lesson.toast.duplicate_name'))
        setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
        if (nameRef.current) {
          nameRef.current.focus()
        }
      } else if (error.message === 'LOCATIONPATH_EXIST') {
        toast.error(t('lesson.toast.duplicate_location_path'))
        setObjCheckInput({ ...defaultObjCheckInput, isValidLocationPath: false })
        if (LocationPathRef.current) {
          LocationPathRef.current.focus()
        }
      } else {
        toast.error(t('lesson.toast.update_failed'))
      }
      if (error.field) {
        setErrorField(error.field)
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Handles navigating to the home page.
  const handleHomeClick = () => {
    const tokens = getFromLocalStorage<any>('tokens')
    if (tokens === null) {
      navigate('/login', {
        replace: true
      })
    }
    navigate('/', {
      replace: true
    })
  }

  // const handleFileChange = (file: File) => {
  //   setUploadedFile(file)
  //   setUploadedFileName(file.name)
  //   setIsValidFile(true)
  //   setExistingFile(null)
  // }

  const { control, watch, getValues, setValue } = useForm<IForm>({
    defaultValues: {
      files: []
    },
    shouldFocusError: false,
    resolver: zodResolver(FormValidationSchema)
  })

  /**
   * Handles removing a file from the file list.
   *
   * @author Hien
   * @param {string} uid - The unique ID of the file to remove.
   */
  const handleRemoveFile = (uid: string) => {
    const newFileList = getValues('files').filter((file) => file.uid !== uid)
    setValue('files', [...newFileList])

    if (newFileList.length === 0) {
      setUploadedFile(null)
      setUploadedFileName(null)
      setIsValidFile(false)
    }
  }

  /**
   * Handles changing the file.
   *
   * @author Hien
   * @async
   * @param {File[]} acceptedFiles - The accepted files.
   * @param {FileRejection[]} fileRejections - The rejected files.
   */
  const handleChangeFile = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    const totalFiles =
      getValues('files').length + acceptedFiles.length + fileRejections.length

    if ((fileRejections.length > 0) || totalFiles > MAX_NUMER_OF_FILES) {
      const errorCode = fileRejections[0]?.errors?.[0]?.code

      if (
        errorCode === DropzoneErrorCode.TooManyFiles ||
        totalFiles > MAX_NUMER_OF_FILES
      ) {
        toast.error((t('lesson.toast.only_one_file_is_allowed')), {
          progress: undefined
        })
      } else if (errorCode === DropzoneErrorCode.FileInvalidType) {
        toast.error((t('lesson.toast.invalid_file_type')), {
          progress: undefined
        })
      } else if (errorCode === DropzoneErrorCode.FileTooLarge) {
        toast.error((t('lesson.toast.file_is_too_large_10_MB')), {
          progress: undefined
        })
      }
      return
    }

    /**
     * Get the base64 representation of the file.
     *
     * @author Hien
     * @param {File} file - The file to convert.
     */
    const acceptedFileListWithPreview: Array<Promise<IUploadFile>> =
      acceptedFiles.map(async (file) => ({
        uid: uuidv4(),
        originalFileObj: file,
        preview: file.type.includes('image')
          ? await getBase64(file)
          : (file.type === 'video/mp4' ? await getVideoCover(file) : '')
      }))

    Promise.all(acceptedFileListWithPreview).then((results) => {
      setValue('files', [...getValues('files'), ...results], {
        shouldValidate: true,
        shouldDirty: true
      })

      if (results.length > 0) {
        setUploadedFile(results[0].originalFileObj)
        setUploadedFileName(results[0].originalFileObj.name)
        setIsValidFile(true)
      }
    })
  }

  /**
   * Get accepted file types based on selected lesson type.
   *
   * @author Hien
   * @returns {Accept} The accepted file types.
   */
  const getAcceptedFileTypes = (): Accept => {
    switch (selectedLessonType) {
      case 'PDF':
        return { 'application/pdf': [] }
      case 'DOC':
        return { 'application/msword': [], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [] }
      default:
        return {}
    }
  }

  /**
   * Extract YouTube video ID from various YouTube URL formats or return the ID if directly provided
   * YouTube Video ID must be exactly 11 characters long and contain only alphanumeric characters, underscores, and hyphens
   * @author Hien
   * @param {string} input - YouTube URL or video ID
   * @returns {string|null} - YouTube video ID or null if not a valid YouTube URL/ID
   */
  const getYouTubeVideoId = (input: string): string | null => {
    if (!input) return null

    // Check if input is already a valid 11-character YouTube video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
      return input
    }

    // Regex patterns to extract video ID from different YouTube URL formats
    const regexPatterns = [
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})(?:[&].*)?$/,
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
      /(?:youtube\.com\/v\/)([a-zA-Z0-9_-]{11})(?:\?.*)?$/,
      /(?:youtube\.com\/watch\?.*&v=)([a-zA-Z0-9_-]{11})(?:[&].*)?$/
    ]

    for (const regex of regexPatterns) {
      const match = input.match(regex)
      if (match && match[1] && /^[a-zA-Z0-9_-]{11}$/.test(match[1])) {
        return match[1]
      }
    }

    return null
  }

  return (
    <main>
      {isLoading
        ? <div className="flex justify-center items-center w-full h-140 mt-20">
          <PacmanLoader
            className='flex justify-center items-center w-full mt-20'
            color='#5EEAD4'
            cssOverride={{
              display: 'block',
              margin: '0 auto',
              borderColor: 'blue'
            }}
            loading
            margin={10}
            speedMultiplier={3}
            size={40}
          /></div>
        : <div className="px-4 sm:px-6 lg:px-8 py-8 w-full max-w-9xl mx-auto ">
          {/* Page header */}
          <div className="mb-8 flex justify-between items-center ">
            {/* Title */}
            <h1 className="text-2xl md:text-3xl text-slate-800 font-bold text-center md:text-left w-full md:w-auto"> {mode === 'edit' ? t('lesson.edit_lesson') : t('lesson.add_lesson')}</h1>
            <div className='hidden md:flex space-x-2'>
              <div className='font-bold cursor-pointer hover:text-red-400 transition-colors duration-300 text-teal-400' onClick={handleHomeClick}>{t('lesson.homepage')}</div>
              <div className='font-bold'>/</div>
              <div className='font-bold'> {mode === 'edit' ? t('lesson.edit_lesson') : t('lesson.add_lesson')}</div>
            </div>
          </div>
          {/* Content */}
          <div className="bg-white shadow-lg rounded-sm border border-slate-200 mb-8">
            <div className="flex flex-col md:flex-row md:-mr-px border rounded ">
              {/* content */}
              <div className='py-10 px-5 w-full'>
                <div className='grid gap-5 md:grid-cols-3'>
                  <div className="flex flex-col">
                    <label htmlFor="courseSelect" className="mb-2 font-bold">{t('lesson.course')}</label>
                    <div className={`${mode === 'edit' ? 'cursor-not-allowed' : ''}`}>
                      <Select
                        id="courseSelect"
                        className={`z-20 w-full h-10 ${mode === 'edit' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        options={courses.map(course => ({ value: course.id, label: course.name }))}
                        value={courses.find(course => course.id === selectedCourse) ? { value: selectedCourse, label: courses.find(course => course.id === selectedCourse)?.name } : null}
                        onChange={(option: SingleValue<OptionType>) => setSelectedCourse(option?.value ?? '')}
                        styles={customStyles(false)}
                        isDisabled={mode === 'edit'}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="categoryLessonSelect" className="mb-2 font-bold">{t('lesson.category_lesson')}</label>
                    <Select
                      id="categoryLessonSelect"
                      className="z-10 w-full h-10"
                      options={categoryLessons.map(categoryLesson => ({ value: categoryLesson.id, label: categoryLesson.name }))}
                      value={categoryLessons.find(categoryLesson => categoryLesson.id === selectedCategoryLesson) ? { value: selectedCategoryLesson, label: categoryLessons.find(categoryLesson => categoryLesson.id === selectedCategoryLesson)?.name } : null}
                      onChange={(option: SingleValue<OptionType>) => setSelectedCategoryLesson(option?.value ?? '')}
                      styles={customStyles(false)}
                    />
                  </div>
                  <div className="flex flex-col">
                    <label htmlFor="lessonTypeSelect" className="mb-2 font-bold">{t('lesson.lesson_type')}</label>
                    <Select
                      id="lessonTypeSelect"
                      className="z-0 w-full h-10"
                      options={lessonTypes}
                      value={
                        lessonTypes.find((type) => type.value === selectedLessonType)
                          ? {
                              value: selectedLessonType,
                              label: lessonTypes.find((type) => type.value === selectedLessonType)
                                ?.label
                            }
                          : null
                      }
                      onChange={(option: SingleValue<OptionType>) => {
                        const nextLessonType = option?.value ?? ''
                        setSelectedLessonType(nextLessonType)
                        if (nextLessonType !== 'PDF') {
                          setAllowDownload(false)
                        }
                        setObjCheckInput({ ...objCheckInput, isValidType: true })
                      }}
                      ref={lessonTypeRef}
                      styles={customStyles(!objCheckInput.isValidType)}
                    />
                  </div>
                </div>
                <div className="grid gap-5 mt-5">
                  <div className='flex flex-col'>
                    <label htmlFor="name" className='mb-2 font-bold'>{t('lesson.lesson_name')}</label>
                    <input id="name"
                      className={objCheckInput.isValidName ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400' : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                      type="text"
                      required
                      value={formInput?.name ?? ''}
                      onChange={(e) => {
                        setFormInput({ ...formInput, name: e.target.value })
                        setObjCheckInput({ ...objCheckInput, isValidName: true })
                      }}
                      ref={nameRef}
                    />
                  </div>
                  <div className='flex flex-col'>
                    <label htmlFor="description" className='mb-2 font-bold'>{t('lesson.lesson_description')}</label>
                    <textarea id="description"
                      className={objCheckInput.isValidDescription ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400' : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                      required
                      value={formInput?.description ?? ''}
                      onChange={(e) => {
                        setFormInput({ ...formInput, description: e.target.value })
                        setObjCheckInput({ ...objCheckInput, isValidDescription: true })
                      }}
                      ref={descriptionRef}
                    />
                  </div>
                  <div className='flex flex-col'>
                    <label htmlFor="Content" className='mb-2 font-bold'>{t('lesson.lesson_content')}</label>
                    <textarea id="Content"
                      className={objCheckInput.isValidContent ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400' : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                      required
                      value={formInput?.content ?? ''}
                      onChange={(e) => {
                        setFormInput({ ...formInput, content: e.target.value })
                        setObjCheckInput({ ...objCheckInput, isValidContent: true })
                      }}
                      ref={contentRef}
                    />
                  </div>
                  {selectedLessonType !== 'MP4' && selectedLessonType !== '' && (
                    <div className='flex flex-col'>
                      <label htmlFor="file" className='mb-2 font-bold'>{t('lesson.lesson_file')}</label>
                      <Controller
                        control={control}
                        name="files"
                        render={({ fieldState: { error } }) => (
                          <UploadFiles
                            maxFiles={MAX_NUMER_OF_FILES}
                            multiple
                            maxSize={MAX_FILE_SIZE}
                            accept={getAcceptedFileTypes()}
                            onDrop={handleChangeFile}
                            errorMessage={error?.message}
                            borderError={!isValidFile}
                          />
                        )}
                      />
                      {uploadedFileName
                        ? (
                          <PreviewFiles
                            fileList={watch('files')}
                            onRemoveFile={handleRemoveFile}
                            className="mt-4"
                          />
                          )
                        : (
                            existingFile && (
                            <div className="mt-2 text-gray-500">
                              {t('lesson.current_file')} <a href={existingFile} target="_blank" rel="noopener noreferrer">{getFileIcon(existingFile)} {existingFile}</a>
                            </div>
                            )
                          )}
                    </div>
                  )}
                  {selectedLessonType === 'MP4' && (
                    <div>
                      <div className='flex flex-col'>
                        <label htmlFor="locationPath" className='mb-2 font-bold'>{t('lesson.location_path')}</label>
                        <input
                          id="locationPath"
                          className={objCheckInput.isValidLocationPath
                            ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400'
                            : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'}
                          type="text"
                          required
                          value={formInput?.locationPath ?? ''}
                          onChange={(e) => {
                            setFormInput({ ...formInput, locationPath: e.target.value })
                            setObjCheckInput({ ...objCheckInput, isValidLocationPath: true })
                          }}
                          ref={LocationPathRef}
                        />
                      </div>

                      {/* Video Preview Section */}
                      <div className="mt-4">
                        {formInput?.locationPath ? (
                          (() => {
                            const videoId = getYouTubeVideoId(formInput.locationPath)

                            if (videoId) {
                              // Valid YouTube link - show video preview
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2 text-green-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">{t('lesson.valid_youtube_link')}</span>
                                  </div>
                                  <div className="w-full md:w-1/2">
                                    <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                      <div className="w-full h-64 bg-black relative">
                                        <iframe
                                          src={`https://www.youtube.com/embed/${videoId}`}
                                          title="YouTube video player"
                                          frameBorder="0"
                                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                          allowFullScreen
                                          className="w-full h-full"
                                        ></iframe>
                                      </div>
                                      <div className="p-4 bg-gray-50 border-t">
                                        <p className="text-sm text-gray-600 font-medium">Video ID: {videoId}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            } else {
                              // Invalid YouTube link - show error message
                              return (
                                <div className="space-y-3">
                                  <div className="flex items-center space-x-2 text-red-600">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                    </svg>
                                    <span className="text-sm font-medium">{t('lesson.invalid_youtube_link')}</span>
                                  </div>
                                  <div className="w-full md:w-1/2">
                                    <div className="border border-red-300 rounded-lg p-6 bg-red-50">
                                      <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-4">
                                        <div className="w-20 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                                          <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
                                          </svg>
                                        </div>
                                        <div className="flex-1">
                                          <h4 className="text-sm font-medium text-red-800 mb-2">
                                            {t('lesson.invalid_video_format')}
                                          </h4>
                                          <p className="text-sm text-red-700 mb-3">
                                            {t('lesson.please_enter_valid_youtube_link')}
                                          </p>
                                          <div className="text-sm text-red-600">
                                            <p className="font-medium mb-2">{t('lesson.supported_formats')}:</p>
                                            <ul className="space-y-1 pl-4">
                                              <li>• https://www.youtube.com/watch?v=VIDEO_ID</li>
                                              <li>• https://youtu.be/VIDEO_ID</li>
                                              <li>• https://www.youtube.com/embed/VIDEO_ID</li>
                                              <li>• {t('lesson.video_id_11_chars')}</li>
                                            </ul>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                            }
                          })()
                        ) : (
                          // Empty input - show placeholder
                          <div className="w-full md:w-1/2">
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center bg-gray-50">
                              <div className="w-20 h-20 mx-auto bg-gray-200 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-10 h-10 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M2 6a2 2 0 012-2h6l2 2h6a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
                                </svg>
                              </div>
                              <p className="text-base text-gray-500 mb-2">{t('lesson.enter_youtube_link_to_preview')}</p>
                              <p className="text-sm text-gray-400">{t('lesson.video_will_appear_here')}</p>
                            </div>
                          </div>
                        )}
                      </div>

                    </div>
                  )}
                </div>
                <div className="flex flex-col">
                  <div className="flex flex-col items-start mt-4 gap-3">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="form-checkbox h-5 w-5 text-teal-600"
                        checked={notify}
                        onChange={(e) => setNotify(e.target.checked)}
                      />
                      <span className="ml-2 font-bold">{t('lesson.notify_users')}</span>
                    </label>
                    {selectedLessonType === 'PDF' && (
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-teal-600"
                          checked={allowDownload}
                          onChange={(e) => setAllowDownload(e.target.checked)}
                        />
                        <span className="ml-2 font-bold">{t('lesson.allow_download')}</span>
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex justify-end mt-6">
                  <button className="bg-gray-300 text-black px-4 py-2 rounded-md mr-2 hover:bg-gray-400 hover:text-black" onClick={handleCancel}>{t('lesson.cancel')}</button>
                  <button
                    className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
                    onClick={async () => mode === 'edit' ? await handleSaveEdit() : await handleSaveChanges()}
                  >
                    {mode === 'edit' ? t('lesson.saveChanges') : t('lesson.add')}
                  </button>
                </div>
              </div>
            </div>
          </div>

        </div>
      }
    </main>
  )
}

export default AddLession
