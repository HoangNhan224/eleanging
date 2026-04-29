/* eslint-disable @typescript-eslint/prefer-optional-chain */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: BasicInfo.tsx
========================================================================== */
import React, { useEffect, useRef, useState } from 'react'
import Select, { SingleValue } from 'react-select'
import { toast } from 'react-toastify'
import { useTranslation } from 'react-i18next'
import { Controller, useForm } from 'react-hook-form'
import PreviewFiles from '../../../../components/PreviewFiles'
import UploadFiles from '../../../../components/UploadFiles'
import { IUploadFile } from '../../../../api/interfaces'
import { zodResolver } from '@hookform/resolvers/zod'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import {
  getBase64,
  getVideoCover
} from '../../../../utils/fileconfig'
import { FileRejection, ErrorCode as DropzoneErrorCode } from 'react-dropzone'
import { getCategoryExam, getGroup, getAllCourseForExamSelect, createExam, uploadImgExam, getExamById, updateExam, fetchAllUser } from '../../../../api/post/post.api'
interface IForm {
  files: IUploadFile[]
}
const MAX_FILE_SIZE = 1024 * 1024 * 5
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

interface BasicInfoProps {
  examId?: number
  addMode?: boolean
  onCreated?: (newExamId: string) => void
}
interface BasicInfoOption {
  value: string
  label: string | undefined
}
interface FormInput {
  id: string
  name: string
  description: string
  categoryExamId: string
  typeExamId: string
  groupId: string | null
  courseId: string | null
  image: string
  createrId: string
}
interface CategoryExam {
  id: string
  name: string
}

interface Group {
  id: string
  name: string
}
interface Course {
  id: string
  name: string
  disabled?: boolean
}
interface User {
  id: string
  username: string
}

type FilterOption = 'COURSE' | 'GROUP'

interface OptionType {
  value: FilterOption
  label: string
}

const options: OptionType[] = [
  { value: 'COURSE', label: 'Dành cho khóa học' },
  { value: 'GROUP', label: 'Dành cho nghiệp vụ' }
]

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

/**
 * BasicInfo component for managing basic information of an exam.
 *
 * @author Hien
 * @component
 * @param {object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered BasicInfo component.
 */
const BasicInfo: React.FC<BasicInfoProps> = ({ examId, addMode, onCreated }) => {
  const { t } = useTranslation()
  // TODO: Initialize state for input validation
  const defaultObjCheckInput = {
    isValidName: true,
    isValidDescription: true,
    isValidCategoryExam: true,
    isValidTypeExam: true,
    isValidGroup: true,
    isValidCourse: true,
    isValidCreator: true
  }
  // TODO: Initialize state for input validation
  const [objCheckInput, setObjCheckInput] = useState(defaultObjCheckInput)
  // TODO: Initialize state for form input
  const [formInput, setFormInput] = useState<FormInput>({
    id: '',
    name: '',
    description: '',
    categoryExamId: '',
    typeExamId: '',
    groupId: null,
    courseId: null,
    image: '',
    createrId: ''
  })
  // TODO: Initialize useRef for input fields
  const nameRef = useRef<any>(null)
  const descriptionRef = useRef<any>(null)
  const categoryExamRef = useRef<any>(null)
  const typeExamRef = useRef<any>(null)
  const groupRef = useRef<any>(null)
  const courseRef = useRef<any>(null)
  const creatorRef = useRef<any>(null)
  // TODO: Initialize state for category exam
  const [categoryExam, setCategoryExam] = useState<CategoryExam[]>([])
  // TODO: Initialize state for selected category exam
  const [selectedCategoryExam, setSelectedCategoryExam] = useState<string>('')
  // TODO: Initialize state for selected type exam
  const [selectedTypeExam, setSelectedTypeExam] = useState<string>('')
  // TODO: Initialize state for group
  const [group, setGroup] = useState<Group[]>([])
  // TODO: Initialize state for selected group
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  // TODO: Initialize state for course
  const [course, setCourse] = useState<Course[]>([])
  // TODO: Initialize state for selected course
  const [selectedCourse, setSelectedCourse] = useState<string>('')
  // TODO: Initialize state for uploaded file
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  // TODO: Initialize state for uploaded file name
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [selectedCreator, setSelectedCreator] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // TODO: Initialize state for error field
  const [errorField, setErrorField] = useState<string>('')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  // TODO: Initialize state for file validation
  const [isValidFile, setIsValidFile] = useState(true)
  // TODO: Fetch exam details on mount
  useEffect(() => {
    /**
     * Fetches the details of an exam by its ID.
     *
     * @author Hien
     * @async
     * @returns {Promise<void>}
     */
    const fetchExamDetails = async () => {
      try {
        // TODO: Check if examId exists
        if (examId) {
          const response = await getExamById(examId)
          if (response.status === 200) {
            const exam = response.data
            setFormInput({
              id: exam.id,
              name: exam.name,
              description: exam.description,
              categoryExamId: exam.categoryExamId,
              typeExamId: exam.typeExamId,
              groupId: exam.groupId,
              courseId: exam.courseId,
              image: exam.image,
              createrId: exam.createrId || ''
            })
            setSelectedCategoryExam(exam.categoryExamId)
            if (exam.typeExamId) {
              setSelectedTypeExam(exam.typeExamId)
            } else {
              setSelectedTypeExam(exam.courseId ? 'COURSE' : (exam.groupId ? 'GROUP' : ''))
            }
            setSelectedGroup(exam.groupId ?? '')
            setSelectedCourse(exam.courseId ?? '')
            setSelectedCreator(exam.createrId || '')
            // TODO: Check if image exists
            if (exam.image) {
              const imageUrl = `${process.env.REACT_APP_API}/uploads/exams/${exam.image}`
              setUploadedFileName(imageUrl)
              const imageResponse = await fetch(imageUrl)
              const imageBlob = await imageResponse.blob()
              const fileFromBlob = new File([imageBlob], exam.image, { type: imageBlob.type })
              const dummyUpload = {
                uid: 'existing-file',
                originalFileObj: fileFromBlob,
                preview: imageUrl
              }
              setValue('files', [dummyUpload], {
                shouldValidate: true,
                shouldDirty: true
              })
            }
          }
        }
      } catch (error) {
        // console.log(error)
      }
    }
    fetchExamDetails()
  }, [examId])
  useEffect(() => {
    /**
     * Fetches all necessary data for the component.
     *
     * @author Hien
     * @async
     * @returns {Promise<void>}
     */
    const fetchAllData = async () => {
      try {
        // TODO: Fetch category exam, group and course
        const [categoryRes, groupRes, courseRes, usersRes] = await Promise.all([
          getCategoryExam(),
          getGroup(),
          getAllCourseForExamSelect(),
          fetchAllUser()
        ])

        // TODO: Check if the request was successful
        if (categoryRes.status === 200) {
          setCategoryExam(categoryRes.data)
        }
        // TODO: Check if the request was successful
        if (groupRes.status === 200) {
          setGroup(groupRes.data)
        }
        // TODO: Check if the request was successful
        if (courseRes.status === 200) {
          setCourse(courseRes.data)
        }
        if (usersRes.status === 200) {
          setUsers(usersRes.data)
        }
      } catch (error) {
        // console.log(error)
      }
    }

    fetchAllData()
  }, [])
  useEffect(() => {
    // TODO: Check if selectedTypeExam is COURSE and course is empty
    if (selectedTypeExam === 'COURSE' && course.length > 0 && course.every(item => item.disabled)) {
      toast.info(t('exam_admin.basic_info.toast.no_course_available'))
    }
  }, [selectedTypeExam])

  /**
   * Handles saving changes to the exam.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSaveChanges = async () => {
    try {
      // TODO: Check if inputs are valid
      if (isValidInputs()) {
        // TODO: Check if uploadedFile exists
        if (!uploadedFile) {
          toast.error(t('exam_admin.basic_info.toast.file_is_required'))
          return
        }
        // TODO: Define allowed file types
        const allowedFileTypes: Record<string, string[]> = {
          image: ['image/jpeg', 'image/png']
        }
        // TODO: Get file type
        const fileType = uploadedFile?.type
        // TODO: Check if file type is valid
        if (fileType && !allowedFileTypes.image.includes(fileType)) {
          toast.error(t('exam_admin.basic_info.toast.invalid_file_type'))
          return
        }
        // TODO: Create payload
        const payload = {
          name: formInput.name,
          description: formInput.description,
          categoryExamId: selectedCategoryExam,
          typeExamId: selectedTypeExam,
          groupId: selectedGroup === '' ? null : selectedGroup,
          courseId: selectedCourse === '' ? null : selectedCourse,
          image: formInput.image,
          createrId: selectedCreator
        }
        // TODO: Check if uploadedFile exists
        if (uploadedFile) {
          const formData = new FormData()
          formData.append('image', uploadedFile)
          const uploadResponse = await uploadImgExam(formData)
          payload.image = uploadResponse.data.image
        }
        const response = await createExam(payload)
        if (response.status === 200) {
          toast.success(t('exam_admin.basic_info.toast.create_successfully'))
          onCreated && onCreated(response.data.id)
        } else {
          toast.error(t('exam_admin.basic_info.toast.create_failed'))
        }
      }
    } catch (error: any) {
      // TODO: Check if error message is NAME_EXIST
      if (error.message === 'NAME_EXIST') {
        toast.error(t('exam_admin.basic_info.toast.duplicate_name'))
        setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
        if (nameRef.current) {
          nameRef.current.focus()
        }
      } else {
        toast.error(t('exam_admin.basic_info.toast.create_failed'))
      }
      // TODO: Check if error field exists
      if (error.field) {
        setErrorField(error.field)
      }
    } finally {
      // setIsLoading(false)
    }
  }

  /**
   * Handles saving changes to the exam.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSaveEdit = async () => {
    try {
      // TODO: Check if examId exists
      if (!examId) {
        toast.error(t('exam_admin.basic_info.toast.exam_not_found'))
        return
      }
      // TODO: Check if inputs are valid
      if (isValidInputs()) {
        // TODO: Create updated payload
        const updatedPayload = {
          name: formInput.name,
          description: formInput.description,
          categoryExamId: selectedCategoryExam,
          typeExamId: selectedTypeExam,
          groupId: selectedGroup === '' ? null : selectedGroup,
          courseId: selectedCourse === '' ? null : selectedCourse,
          image: formInput.image,
          createrId: selectedCreator
        }
        // TODO: Check if uploadedFile exists
        if (uploadedFile) {
          const formData = new FormData()
          formData.append('image', uploadedFile)
          const uploadResponse = await uploadImgExam(formData)
          updatedPayload.image = uploadResponse.data.image
        }
        // TODO: Update exam
        const response = await updateExam(examId, updatedPayload)
        // TODO: Check if the request was successful
        if (response.status === 200) {
          toast.success(t('exam_admin.basic_info.toast.update_successfully'))
          onCreated && onCreated(response.data.id)
        } else {
          toast.error(t('exam_admin.basic_info.toast.update_failed'))
        }
      }
    } catch (error: any) {
      // TODO: Check if error message is NAME_EXIST
      if (error.message === 'NAME_EXIST') {
        toast.error(t('exam_admin.basic_info.toast.duplicate_name'))
        setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
        if (nameRef.current) {
          nameRef.current.focus()
        }
      } else {
        toast.error(t('exam_admin.basic_info.toast.update_failed'))
      }
      if (error.field) {
        setErrorField(error.field)
      }
    }
  }
  /**
   * Validates the input fields.
   *
   * @author Hien
   * @returns {boolean} True if all inputs are valid, false otherwise.
   */
  const isValidInputs = () => {
    setObjCheckInput(defaultObjCheckInput)
    setIsValidFile(true)

    // TODO: Check if name is empty
    if (formInput.name === '' || formInput.name === null) {
      toast.error(t('exam_admin.basic_info.toast.name_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
      if (nameRef.current) {
        nameRef.current.focus()
      }
      return false
    }
    // TODO: Check if name is too long
    if (formInput.name.length > 255) {
      toast.error(t('exam_admin.basic_info.toast.name_is_too_long'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidName: false })
      if (nameRef.current) {
        nameRef.current.focus()
      }
      return false
    }
    // TODO: Check if category exam is empty
    if (selectedCategoryExam === '' || selectedCategoryExam === null) {
      toast.error(t('exam_admin.basic_info.toast.category_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidCategoryExam: false })
      if (categoryExamRef.current) {
        categoryExamRef.current.focus()
      }
      return false
    }
    // TODO: Check if type exam is empty
    if (selectedTypeExam === '' || selectedTypeExam === null) {
      toast.error(t('exam_admin.basic_info.toast.type_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidTypeExam: false })
      if (typeExamRef.current) {
        typeExamRef.current.focus()
      }
      return false
    }
    // TODO: Check if selectedTypeExam is GROUP and group is empty
    if (selectedTypeExam === 'GROUP' && (selectedGroup === '' || selectedGroup === null)) {
      toast.error(t('exam_admin.basic_info.toast.group_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidGroup: false })
      if (groupRef.current) {
        groupRef.current.focus()
      }
      return false
    }
    // TODO: Check if selectedTypeExam is COURSE and course is empty
    if (selectedTypeExam === 'COURSE' && (selectedCourse === '' || selectedCourse === null)) {
      toast.error(t('exam_admin.basic_info.toast.course_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidCourse: false })
      if (courseRef.current) {
        courseRef.current.focus()
      }
      return false
    }
    // TODO: Check if description is empty
    if (formInput.description === '' || formInput.description === null) {
      toast.error(t('exam_admin.basic_info.toast.description_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidDescription: false })
      if (descriptionRef.current) {
        descriptionRef.current.focus()
      }
      return false
    }
    if (selectedCreator === '' || selectedCreator === null) {
      toast.error(t('exam_admin.basic_info.toast.creator_is_required'))
      setObjCheckInput({ ...defaultObjCheckInput, isValidCreator: false })
      if (creatorRef.current) {
        creatorRef.current.focus()
      }
      return false
    }
    // TODO: Check if uploadedFile exists
    if (!uploadedFile && !formInput.image) {
      toast.error(t('exam_admin.basic_info.toast.file_is_required'))
      setIsValidFile(false)
      return false
    }
    return true
  }

  // TODO: Initialize useForm
  const { control, watch, getValues, setValue } = useForm<IForm>({
    defaultValues: {
      files: []
    },
    shouldFocusError: false,
    resolver: zodResolver(FormValidationSchema)
  })

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
    // TODO: Calculate total files
    const totalFiles =
      getValues('files').length + acceptedFiles.length + fileRejections.length

    // TODO: Check if fileRejections exists or totalFiles is greater than MAX_NUMER_OF_FILES
    if ((fileRejections.length > 0) || totalFiles > MAX_NUMER_OF_FILES) {
      const errorCode = fileRejections[0]?.errors?.[0]?.code

      if (
        errorCode === DropzoneErrorCode.TooManyFiles ||
        totalFiles > MAX_NUMER_OF_FILES
      ) {
        toast.error((t('exam_admin.basic_info.toast.only_one_file_is_allowed')), {
          progress: undefined
        })
      } else if (errorCode === DropzoneErrorCode.FileInvalidType) {
        toast.error((t('exam_admin.basic_info.toast.invalid_file_type')), {
          progress: undefined
        })
      } else if (errorCode === DropzoneErrorCode.FileTooLarge) {
        toast.error((t('exam_admin.basic_info.toast.file_is_too_large_10_MB')), {
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

    // TODO: Resolve all promises
    Promise.all(acceptedFileListWithPreview).then((results) => {
      setValue('files', [...getValues('files'), ...results], {
        shouldValidate: true,
        shouldDirty: true
      })

      // TODO: Check if results exists
      if (results.length > 0) {
        setUploadedFile(results[0].originalFileObj)
        setUploadedFileName(results[0].originalFileObj.name)
        setIsValidFile(true)
      }
    })
  }
  /**
   * Handles removing a file from the file list.
   *
   * @author Hien
   * @param {string} uid - The unique ID of the file to remove.
   */
  const handleRemoveFile = (uid: string) => {
    const newFileList = getValues('files').filter((file) => file.uid !== uid)
    setValue('files', [...newFileList])

    // TODO: Check if newFileList is empty
    if (newFileList.length === 0) {
      setUploadedFile(null)
      setUploadedFileName(null)
      setIsValidFile(false)
      setFormInput(prev => ({ ...prev, image: '' }))
    }
  }
  return (
    <div className="flex gap-4 p-3 w-full">
      {/* Left Section */}
      <div className="w-2/5 flex flex-col gap-2">
        <div className='flex flex-col'>
          <label htmlFor="file" className='mb-2 font-bold'>{t('exam_admin.basic_info.image_exam')}</label>
          <Controller
            control={control}
            name="files"
            render={({ fieldState: { error } }) => (
              <UploadFiles
                maxFiles={MAX_NUMER_OF_FILES}
                multiple
                maxSize={MAX_FILE_SIZE}
                accept={{ 'image/jpeg': [], 'image/png': [] }}
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
            : null}
        </div>
      </div>

      {/* Right Section */}
      <div className="w-3/5 flex flex-col gap-2">
        <div className="w-full">
          <div className='flex flex-col'>
            <label htmlFor="name" className='mb-2 font-bold'>{t('exam_admin.basic_info.name_exam')}</label>
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
        </div>
        <div className="w-full">
          <div className="flex flex-col">
            <label htmlFor="categoryExamSelect" className="mb-2 font-bold">{t('exam_admin.basic_info.category_exam')}</label>
            <Select
              id="categoryExamSelect"
              className="z-20 w-full h-10"
              options={categoryExam.map(categoryExam => ({ value: categoryExam.id, label: categoryExam.name }))}
              value={categoryExam.find(categoryExam => categoryExam.id === selectedCategoryExam) ? { value: selectedCategoryExam, label: categoryExam.find(categoryExam => categoryExam.id === selectedCategoryExam)?.name } : null}
              onChange={(option: SingleValue<BasicInfoOption>) => {
                setSelectedCategoryExam(option?.value ?? '')
                setObjCheckInput(prev => ({ ...prev, isValidCategoryExam: true }))
              }}
              ref={categoryExamRef}
              styles={customStyles(!objCheckInput.isValidCategoryExam)}
              placeholder={t('exam_admin.basic_info.choose_category')}
            />
          </div>
        </div>
        <div className="w-full">
          <div className="flex flex-col">
            <label htmlFor="typeExam" className="mb-2 font-bold">{t('exam_admin.basic_info.type_exam')}</label>
            <Select
              id="typeExam"
              className="z-15 w-full h-10"
              options={options}
              value={
                options.find((opt) => opt.value === selectedTypeExam)
                  ? {
                      value: selectedTypeExam as FilterOption,
                      label: options.find((opt) => opt.value === selectedTypeExam)?.label ?? ''
                    }
                  : null
              }
              onChange={(option) => {
                setSelectedTypeExam(option?.value ?? '')
                setObjCheckInput({ ...objCheckInput, isValidTypeExam: true })
                setSelectedGroup('')
                setSelectedCourse('')
              }}
              ref={typeExamRef}
              styles={customStyles(!objCheckInput.isValidTypeExam)}
              placeholder={t('exam_admin.basic_info.choose_type')}
              isDisabled={!addMode}
              formatOptionLabel={(option: OptionType) =>
                t(`exam_admin.basic_info.${option.value === 'COURSE' ? 'course_exam' : 'group_exam'}`)
              }
            />
          </div>
        </div>
        {selectedTypeExam === 'GROUP' && (
          <div className="w-full">
            <div className="flex flex-col">
              <label htmlFor="group" className="mb-2 font-bold">{t('exam_admin.basic_info.group_exam')}</label>
              <Select
                id="group"
                className="z-15 w-full h-10"
                options={group.map(group => ({ value: group.id, label: group.name }))}
                value={group.find(group => group.id === selectedGroup) ? { value: selectedGroup, label: group.find(group => group.id === selectedGroup)?.name } : null}
                onChange={(option: SingleValue<BasicInfoOption>) => {
                  setSelectedGroup(option?.value ?? '')
                  setObjCheckInput({ ...objCheckInput, isValidGroup: true })
                }}
                ref={groupRef}
                styles={customStyles(!objCheckInput.isValidGroup)}
                placeholder={t('exam_admin.basic_info.choose_group')}
                isDisabled={!addMode}
              />
            </div>
          </div>
        )}

        {selectedTypeExam === 'COURSE' && (
          <div className="w-full">
            <div className="flex flex-col">
              <label htmlFor="course" className="mb-2 font-bold">{t('exam_admin.basic_info.course_exam')}</label>
              <Select
                id="course"
                className="z-5 w-full h-10"
                options={course.map(courseItem => ({
                  value: courseItem.id,
                  label: courseItem.name,
                  isDisabled: courseItem.disabled
                }))}
                value={
                  course.find(item => item.id === selectedCourse)
                    ? { value: selectedCourse, label: course.find(item => item.id === selectedCourse)?.name }
                    : null
                }
                onChange={(option: SingleValue<BasicInfoOption>) => {
                  setSelectedCourse(option?.value ?? '')
                  setObjCheckInput({ ...objCheckInput, isValidCourse: true })
                }}
                ref={courseRef}
                styles={customStyles(!objCheckInput.isValidCourse)}
                placeholder={t('exam_admin.basic_info.choose_course')}
                isDisabled={!addMode}
              />
            </div>
          </div>
        )}

        <div className="w-full">
          <div className='flex flex-col'>
            <label htmlFor="description" className='mb-2 font-bold'>{t('exam_admin.basic_info.description_exam')}</label>
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
        </div>

        <div className="w-full">
          <div className="flex flex-col">
            <label htmlFor="creatorSelect" className="mb-2 font-bold">{t('exam_admin.basic_info.creator')}</label>
            <Select
              id="creatorSelect"
              className="z-5 w-full h-10"
              options={users.map(user => ({
                value: user.id,
                label: user.username
              }))}
              value={users.find(user => user.id === selectedCreator)
                ? {
                    value: selectedCreator,
                    label: users.find(user => user.id === selectedCreator)?.username
                  }
                : null}
              onChange={(option: SingleValue<BasicInfoOption>) => {
                setSelectedCreator(option?.value ?? '')
                setObjCheckInput(prev => ({ ...prev, isValidCreator: true }))
              }}
              ref={creatorRef}
              styles={customStyles(!objCheckInput.isValidCreator)}
              placeholder={t('exam_admin.basic_info.choose_creator')}
              isSearchable={true}
            />
          </div>
        </div>
        <div className='flex justify-end w-full mt-4'>
          <button
            className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
            type="button"
            onClick={examId ? handleSaveEdit : handleSaveChanges}
          >
            {examId
              ? t('exam_admin.basic_info.save_changes')
              : t('exam_admin.basic_info.create')
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default BasicInfo
