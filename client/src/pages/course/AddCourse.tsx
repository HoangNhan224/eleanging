/* eslint-disable @typescript-eslint/brace-style */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// PAGE: COURSE
//    ========================================================================== */
import React, { useEffect, useState, useCallback } from 'react'
import { toast } from 'react-toastify'
import { addCourse, getCategoryCourseData, fetchAllUser } from 'api/post/post.api'
import { FileRejection, ErrorCode as DropzoneErrorCode, Accept } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

import Select, { SingleValue } from 'react-select' // Import SingleValue từ react-select
import {
  getBase64,
  getVideoCover
} from '../../utils/fileconfig'
import PreviewFiles from '../../components/PreviewFiless'
import UploadFiles from '../../components/UploadFiles'
import { IUploadFile } from '../../api/interfaces'
import { useNavigate } from 'react-router-dom'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { format } from 'date-fns'
// import { getFromLocalStorage } from 'utils/functions'
import { useTranslation } from 'react-i18next'
import { useDatePickerLocale } from '../../hooks/useDatePickerLocale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

interface Course {
  categoryCourseId: number
  name: string
  summary: string
  assignedBy: number
  durationInMinute: string // consider changing this to number if it's always a number
  startDate: string
  endDate: string
  description: string
  locationPath: string
  prepare: string
  price: number
  file?: File // Change this property to File
  publicStatus: number // 0 or 1 based on checkbox
  publicDate: string | null // Date if publicStatus is 1
  descriptionParts?: string[]
  prepareParts?: string[]
}
interface Category {
  id: number
  name: string
}
interface User {
  id: number
  username: string
}
interface IForm {
  locationPath: IUploadFile[]
}
const MAX_FILE_SIZE = 1024 * 1024 * 5
const MAX_NUMER_OF_FILES = 1

const FormValidationSchema = z.object({
  locationPath: z.array(z.instanceof(File)).min(1, 'Vui lòng chọn file!')
})

const AddCourse = () => {
  const { t, i18n } = useTranslation()
  const { locale, dateTimeFormat } = useDatePickerLocale()
  const navigate = useNavigate()
  const [dataCategory, setDataCategory] = useState<Category[] | null>(null)
  const [dataUser, setDataUser] = useState<User[] | null>(null)
  const [tempPublicDate, setTempPublicDate] = useState<Date | null>(null)
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null)
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null)
  // const [, setImagePreview] = useState<string | null>(null)
  // const currentUserID = Number(JSON.parse(localStorage.getItem('tokens') ?? '{}').id)
  const [isChecked, setIsChecked] = useState(false)
  const [notifyUsers, setNotifyUsers] = useState(false)
  // const tokens = getFromLocalStorage('tokens')
  // const currentUserID = tokens.id
  const [courseData, setCourseData] = useState<Course>({
    categoryCourseId: 1,
    name: '',
    summary: '',
    assignedBy: 1,
    durationInMinute: '',
    startDate: '',
    endDate: '',
    description: '',
    locationPath: '',
    prepare: '',
    price: 0,
    publicStatus: 0,
    publicDate: null,
    descriptionParts: [''], // Initialize as an array of strings
    prepareParts: ['']
  })
  // const currentUserID = Number(getFromLocalStorage('tokens')?.id)

  const [invalidFields, setInvalidFields] = useState<string[]>([])

  useEffect(() => {
    fetchData()
    console.log(fetchData)
  }, [])
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setIsChecked(checked)
    setCourseData(prevState => ({
      ...prevState,
      publicStatus: checked ? 2 : 0, // Default to Hidden if checked
      publicDate: checked ? null : prevState.publicDate // Set publicDate to null when checked
    }))
  }

  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target
    setCourseData(prevState => ({
      ...prevState,
      publicStatus: value === 'publicDate' ? 1 : 2, // Set publicStatus based on selected radio button
      publicDate: value === 'publicDate' ? prevState.publicDate : null // Retain publicDate if 'publicDate' is selected
    }))
  }
  const fetchData = useCallback(async () => {
    try {
      const response = await getCategoryCourseData()
      setDataCategory(response.data)
      const response1 = await fetchAllUser()
      setDataUser(response1.data)
    } catch (error) {
      setDataCategory(null)
      setDataUser(null)
    }
  }, [])

  const addNewInput = () => {
    // Check if descriptionParts array exists in courseData
    if (courseData.descriptionParts) {
      // Create a new copy of the descriptionParts array and add an empty string as a new element
      const newDescriptionParts = [...courseData.descriptionParts, '']
      // Update the state by spreading the current courseData and replacing the descriptionParts array
      setCourseData({
        ...courseData, // Spread the existing properties of courseData
        descriptionParts: newDescriptionParts // Replace descriptionParts with the updated array
      })
    }
  }
  const addPreparePart = () => {
    // Check if prepareParts array exists in courseData
    if (courseData.prepareParts) {
      // Create a new copy of the prepareParts array and add an empty string as a new element
      const newPrepareParts = [...courseData.prepareParts, '']
      // Log the new prepareParts array for debugging purposes
      console.log('Check input prepareParts:', newPrepareParts)
      // Update the state by spreading the current courseData and replacing the prepareParts array
      setCourseData({
        ...courseData, // Spread the existing properties of courseData
        prepareParts: newPrepareParts // Replace prepareParts with the updated array
      })
    }
  }
  const removeInputprepareParts = (index: number) => {
    // Check if prepareParts array exists in courseData
    if (courseData.prepareParts) {
      // Create a new array by filtering out the element at the given index
      const newPrepareParts = courseData.prepareParts.filter((_, i) => i !== index)
      // Log the new prepareParts array for debugging purposes
      console.log('Check out prepareParts:', newPrepareParts)
      // Update the state by spreading the current courseData and replacing the prepareParts array
      setCourseData({
        ...courseData, // Spread the existing properties of courseData
        prepareParts: newPrepareParts // Replace prepareParts with the updated array
      })
    }
  }
  const handleDateChange = (date: Date | null, field: 'startDate' | 'endDate' | 'publicDate') => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd HH:mm') // Format thành 'yyyy-MM-dd HH:mm'
      if (field === 'startDate') {
        setTempStartDate(date)
        setCourseData((prevState) => ({
          ...prevState,
          startDate: formattedDate
        }))
      } else if (field === 'endDate') {
        setTempEndDate(date)
        setCourseData((prevState) => ({
          ...prevState,
          endDate: formattedDate
        }))
      }
      else if (field === 'publicDate') {
        setTempPublicDate(date)
        setCourseData((prevState) => ({
          ...prevState,
          publicDate: formattedDate
        }))
      }
      setInvalidFields((prevState) => prevState.filter((f) => f !== field))
    }
  }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Ensure courseData.descriptionParts and courseData.prepareParts are defined as arrays
    const newDescriptionParts = courseData.descriptionParts ? [...courseData.descriptionParts] : []
    const newPrepareParts = courseData.prepareParts ? [...courseData.prepareParts] : []

    // Handle changes for description parts
    if (name.startsWith('descriptionPart')) {
      const index = parseInt(name.replace('descriptionPart', ''), 10) - 1 // Extract the part index from the input name
      newDescriptionParts[index] = value // Update the corresponding description part

      // Join all non-empty description parts with ';; '
      const description = newDescriptionParts.filter(Boolean).join(';; ')
      setCourseData(prevState => ({
        ...prevState,
        descriptionParts: newDescriptionParts, // Update descriptionParts in state
        description // Update the concatenated description in state
      }))

      // Remove invalid field if it's being edited
      if (invalidFields.includes(name)) {
        setInvalidFields(prevState => prevState.filter(field => field !== name))
      }
      console.log('Current courseData before API call:', courseData)
    }

    // Handle changes for prepare parts
    else if (name.startsWith('preparePart')) {
      const index = parseInt(name.replace('preparePart', ''), 10) - 1 // Extract the part index from the input name
      newPrepareParts[index] = value // Update the corresponding prepare part

      // Join all non-empty prepare parts with ';; '
      const prepare = newPrepareParts.filter(Boolean).join(';; ')
      setCourseData(prevState => ({
        ...prevState,
        prepareParts: newPrepareParts, // Update prepareParts in state
        prepare // Update the concatenated prepare string in state
      }))

      // Remove invalid field if it's being edited
      if (invalidFields.includes(name)) {
        setInvalidFields(prevState => prevState.filter(field => field !== name))
      }
    }

    // Handle changes for publicDate
    else if (name === 'publicDate') {
    // Check if value is a valid date in the format 'yyyy-MM-ddTHH:mm
      const parsedDate = value ? new Date(value) : null // Convert string to Date or set to null
      setTempStartDate(parsedDate)

      const isCompleteDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)

      if (isCompleteDate) {
        // Handle complete date logic
      }
    }
    if (name === 'startDate') {
      const parsedDate = value ? new Date(value) : null // Convert string to Date or set to null
      setTempStartDate(parsedDate)

      const isCompleteDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)

      if (isCompleteDate) {
        // Handle complete date logic
      }
    } else if (name === 'endDate') {
      const parsedDate = value ? new Date(value) : null // Convert string to Date or set to null
      setTempEndDate(parsedDate)

      const isCompleteDate = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)

      if (isCompleteDate) {
        // Handle complete date logic
      }
    }

    // Handle changes for all other fields
    else {
      setCourseData(prevState => ({
        ...prevState,
        [name]: value // Update the specific field by name
      }))

      // Remove the current field from the invalid fields list
      setInvalidFields(prevState => prevState.filter(field => field !== name))
    }
  }

  const handleCategoryChange = (newValue: SingleValue<{ value: number, label: string }>) => {
    // Check if a new value was selected
    if (newValue) {
      const value = newValue.value // Extract the `value` from the selected object
      // Update `courseData` state with the new `categoryCourseId`
      setCourseData((prevState) => ({
        ...prevState,
        categoryCourseId: value // Set `categoryCourseId` to the selected value
      }))
      // Remove `categoryCourseId` from `invalidFields` if it exists
      setInvalidFields((prevState) => prevState.filter(field => field !== 'categoryCourseId'))
    }
  }
  const validateFields = (data: Course) => {
    const invalid: string[] = [] // Array to store invalid field names
    const now = new Date()
    now.setHours(now.getHours()) // Adjust the current time by adding 7 hours

    // Check if the course category is selected (ID should not be 0)
    if (data.categoryCourseId === 0) {
      invalid.push('categoryCourseId')
      toast.error(t('add_courses.please_select_a_category_for_the_course'))
    }

    // Check if the name field is empty
    else if (data.name.trim() === '') {
      invalid.push('name')
      toast.error(t('add_courses.name_is_required'))
    }

    // Check if the assignedBy field is empty (ID should not be 0)
    else if (data.assignedBy === 0) {
      invalid.push('assignedBy')
      toast.error(t('add_courses.assigned_by_is_required'))
    }
    // Check if the startDate field is empty
    else if (data.startDate.trim() === '') {
      invalid.push('startDate')
      toast.error(t('add_courses.start_date_is_required'))
    }

    // Check if the endDate field is empty
    else if (data.endDate.trim() === '') {
      invalid.push('endDate')
      toast.error(t('add_courses.end_date_is_required'))
    }

    // Ensure that the startDate is in the future
    else if (new Date(data.startDate) <= now) {
      invalid.push('startDate')
      toast.error(t('add_courses.start_date_must_be_in_the_future'))
    }

    // Ensure that the endDate is after the startDate
    else if (new Date(data.startDate) >= new Date(data.endDate)) {
      invalid.push('endDate')
      toast.error(t('add_courses.end_date_must_be_after_start_date'))
    }

    // Check if the durationInMinute field is empty
    else if (String(data.durationInMinute).trim() === '') {
      invalid.push('durationInMinute')
      toast.error(t('add_courses.duration_is_required'))
    }
    // Check if the durationInMinute field is a valid number
    else if (!/^\d+$/.test(String(data.durationInMinute))) {
      invalid.push('durationInMinute')
      toast.error(t('add_courses.duration_must_be_positive_integer'))
    }
    // Uncomment the following block if price validation is needed
    // // Check if the price field is empty
    // else if (data.price.trim() === '') {
    //   invalid.push('price')
    //   toast.error('Price cannot be empty')
    // }

    // // Check if the price is a valid number (including decimals)
    // else if (!/^\d+(\.\d+)?$/.test(data.price.trim())) {
    //   invalid.push('price')
    //   toast.error('Price must be a valid number')
    // }

    // Check if the public status is 1 and if the publicDate is valid
    else if (data.publicStatus === 1 && (!data.publicDate || new Date(data.publicDate) <= now)) {
      invalid.push('publicDate')
      toast.error(t('add_courses.public_date_must_be_in_the_future'))
    }

    return invalid // Return the array of invalid field names
  }

  const handleAddCourse = async () => {
    // Update publicDate to the current date if the course is 'Hidden' (publicStatus = 2)
    if (courseData.publicStatus === 2) {
      courseData.publicDate = new Date().toISOString()
    }

    // Concatenate the description parts into a single string, separating them with ';;'
    const description = courseData.descriptionParts?.filter(Boolean).join(';;') ?? ''
    courseData.description = description

    // Concatenate the preparation parts into a single string, separating them with ';;'
    const prepare = courseData.prepareParts?.filter(Boolean).join(';;') ?? ''
    courseData.prepare = prepare

    // Validate the course data to identify any invalid fields
    const invalid = validateFields(courseData)
    setInvalidFields(invalid) // Update the state with the invalid fields

    // If no fields are invalid, proceed with the submission
    if (invalid.length === 0) {
      // Check the uploaded file's extension (image must be in jpg, jpeg, png, or gif format)
      const file = courseData.file as File
      if (file) {
        const fileExtension = file.name.split('.').pop()?.toLowerCase()
        if (!fileExtension || !['jpg', 'jpeg', 'png', 'gif'].includes(fileExtension)) {
          // Show an error message if the file extension is not valid
          toast.error(t('add_courses.only_image_jpeg_png_gif_formats_are_supported'))
          setInvalidFields((prevState) => [...prevState, 'locationPath'])
          return
        }
      } else {
        // Show an error message if no file is uploaded
        toast.error(t('add_courses.please_upload_an_image'))
        setInvalidFields((prevState) => [...prevState, 'locationPath'])
        return
      }

      // Check if the public checkbox is selected but neither 'Public' nor 'Hidden' is selected
      if (isChecked && !(courseData.publicStatus === 1 || courseData.publicStatus === 2)) {
        toast.error(t('add_courses.please_select_either_public_now_or_public_appointment'))
        setInvalidFields((prevState) => [...prevState, 'publicStatus'])
        return
      }

      try {
        // Create a FormData object to hold the course data
        const formData = new FormData()
        Object.keys(courseData).forEach((key) => {
          // Skip the file field and skip appending 'publicDate' if it is null
          if (key !== 'file' && (key !== 'publicDate' || courseData.publicDate !== null)) {
            formData.append(key, String(courseData[key as keyof Course]))
          }
        })

        // Append the file to the FormData if a file is present
        if (courseData.file) {
          formData.append('file', courseData.file)
        }

        // Append notifyUsers flag
        formData.append('notifyUsers', notifyUsers.toString())

        // Submit the course data
        await addCourse(formData)
        toast.success(t('add_courses.course_added_successfully'))

        // Redirect the user to the course list page after successful submission
        navigate('/course')

        // Reset the course data form after successful submission
        setCourseData({
          categoryCourseId: 1,
          name: '',
          summary: '',
          assignedBy: 1,
          durationInMinute: '',
          startDate: '',
          endDate: '',
          description: '',
          locationPath: '', // Reset the file path
          prepare: '',
          price: 0, // If price is not entered, default to 0
          publicStatus: 0,
          publicDate: null
        })
      } catch (error: any) {
        // Handle specific error messages from the server
        if (error.message === 'A course with this name already exists') {
          toast.error(t('add_courses.course_name_already_exists'))
          setInvalidFields((prevState) => [...prevState, 'name'])
        } else if (error.message === 'The assignedBy value must correspond to an existing user ID') {
          toast.error(t('add_courses.the_assigned_value_must_correspond_to_an_existing_user'))
          setInvalidFields((prevState) => [...prevState, 'assignedBy'])
        } else {
          // Generic error handling for other cases
          toast.error(t('add_courses.add_error'))
        }
      }
    }
  }

  const removeInput = (index: number) => {
    // Check if descriptionParts array exists
    if (courseData.descriptionParts) {
      // Filter out the item at the given index
      const newDescriptionParts = courseData.descriptionParts.filter((_, i) => i !== index)
      // Log the updated descriptionParts array to the console for debugging
      console.log('Updated descriptionParts:', newDescriptionParts)
      // Update the courseData state with the new descriptionParts array
      setCourseData({
        ...courseData, // Spread the existing courseData
        descriptionParts: newDescriptionParts // Replace the descriptionParts with the updated array
      })
    }
  }
  const { control, watch, getValues, setValue } = useForm<IForm>({
    defaultValues: {
      locationPath: []
    },
    shouldFocusError: false,
    resolver: zodResolver(FormValidationSchema)
  })

  const handleRemoveFile = (uid: string) => {
    const newFileList = getValues('locationPath').filter((file) => file.uid !== uid)
    setValue('locationPath', [...newFileList])

    // Clear the file from courseData if no files are left
    if (newFileList.length === 0) {
      setCourseData(prevState => ({
        ...prevState,
        file: undefined
      }))
    }
  }

  const handleChangeFile = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    // Calculate the total number of files, including accepted files and rejections
    const totalFiles =
      getValues('locationPath').length + acceptedFiles.length + fileRejections.length

    // Reset the invalidFields array, removing any previous 'locationPath' errors before validating the new files
    setInvalidFields(prev => prev.filter(field => field !== 'locationPath'))

    // Check for any errors during file upload
    if (fileRejections.length || totalFiles > MAX_NUMER_OF_FILES) {
      const errorCode = fileRejections[0]?.errors?.[0]?.code

      // Handle specific error cases
      if (
        errorCode === DropzoneErrorCode.TooManyFiles ||
        totalFiles > MAX_NUMER_OF_FILES
      ) {
        toast.error(t('add_courses.you_can_upload_1_image'), {
          progress: undefined
        })
        setInvalidFields(prev => [...prev, 'locationPath']) // Add 'locationPath' to invalidFields
      } else if (errorCode === DropzoneErrorCode.FileInvalidType) {
        toast.error(t('add_courses.file_format_is_not_supported'), {
          progress: undefined
        })
        setInvalidFields(prev => [...prev, 'locationPath']) // Add 'locationPath' to invalidFields
      } else if (errorCode === DropzoneErrorCode.FileTooLarge) {
        toast.error(t('add_courses.you_can_only_upload_file_up_to_5MB'), {
          progress: undefined
        })
        setInvalidFields(prev => [...prev, 'locationPath']) // Add 'locationPath' to invalidFields
      }
      return
    }

    // Map the accepted files and generate a preview (for images or videos)
    const acceptedFileListWithPreview: Array<Promise<IUploadFile>> =
      acceptedFiles.map(async (file) => ({
        uid: uuidv4(), // Generate a unique identifier for the file
        originalFileObj: file, // Store the original file object
        preview: await (file.type.includes('image') // Generate a base64 preview for images or a video cover for videos
          ? getBase64(file)
          : getVideoCover(file))
      }))

    // After processing all files, update the 'locationPath' value with the new files
    Promise.all(acceptedFileListWithPreview).then((results) => {
      setValue('locationPath', [...getValues('locationPath'), ...results], {
        shouldValidate: true,
        shouldDirty: true
      })

      // Update the courseData state with the first accepted file
      setCourseData(prevState => ({
        ...prevState,
        file: acceptedFiles[0]
      }))
    })
  }

  // các dạng file được upload
  const getAcceptedFileTypes = (): Accept => {
    return {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg']
    }
  }
  const handleCancel = () => {
    navigate('/course')
  }
  // chỉnh màu select
  const customStyles = (isError: boolean) => ({
    control: (provided: any, state: any) => ({
      ...provided,
      height: '2.5rem',
      borderColor: isError ? 'red' : state.isFocused ? 'gray' : provided.borderColor,
      boxShadow: isError ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px gray' : provided.boxShadow,
      '&:hover': {
        borderColor: isError ? 'red' : state.isFocused ? 'gray' : provided['&:hover'].borderColor
      }
    })
  })
  // Function to convert a date string into 'datetime-local' format

  const categoryNames = dataCategory?.map((item: Category) => ({ id: item.id, name: item.name })) ?? []
  const assignedBys = dataUser?.map((item: User) => ({ id: item.id, name: item.username })) ?? []
  const options = categoryNames.map((category) => ({
    value: category.id,
    label: category.name
  }))
  const options1 = assignedBys.map((category) => ({
    value: category.id,
    label: category.name
  }))
  const handleInstructorChange = (newValue: SingleValue<{ value: number, label: string }>) => {
    // Check if a new value is selected (i.e., newValue is not null or undefined).
    if (newValue) {
      const value = newValue.value
      // Extract the 'value' from the selected object.
      setCourseData((prevState) => ({
        ...prevState,
        assignedBy: value
        // Update the 'assignedBy' field in the course data with the selected value.
      }))
      setInvalidFields((prevState) =>
        prevState.filter(field => field !== 'assignedBy')
      )
      // Remove 'assignedBy' from the invalid fields list, assuming it's now valid.
    }
  }

  return (
    <div className="flex flex-col space-y-4 mb-5">
      <div>
        <h1 className="mt-2 ml-5 text-xl flex items-center">
        <button className="btn bg-green-500 mt-3 hover:bg-green-400 p-1.5 rounded-sm">
        <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
        </button>
        <span className="mt-2 ml-5 text-xl flex items-center">{t('add_courses.add_course')}</span>
        </h1>
      </div>
      {/* <h2 className="text-xl font-bold mb-4">Add New Course</h2> */}
      <table className="border-2 border-gray-300 ml-5 mr-5 rounded-md">
        <tbody>
          <div className="lg:flex md:flex">
              <div className="md:w-1/2 mr-5 ml-5 mt-4">
                <label htmlFor="categoryCourseId" className="block text-sm font-medium text-gray-900 ml-2 mb-4">
                    {t('add_courses.category_course')}:
                  </label>
                  <Select
                    name="categoryCourseId"
                    className={`w-full text-gray-900 outline-none cursor-pointer rounded-md bg-gray-100 border h-10 ${
                      invalidFields.includes('categoryCourseId') ? 'border-red-500' : ''
                    }`}
                    value={
                      options.find(option => option.value === courseData.categoryCourseId) ??
                      options[0] // Set default to the first option if no value is selected
                    }
                    onChange={handleCategoryChange}
                    options={options}
                    classNamePrefix="react-select"
                    styles={customStyles(false)}
                  />
              </div>
            <div className="md:w-1/2 mr-5 ml-5 mt-4">
              <label htmlFor="assignedBy" className="block text-sm font-medium text-gray-900 ml-2 mr-2 mb-4">
                {t('add_courses.instructor')}:
              </label>
              <Select
                name="assignedBy"
                className={`w-full text-gray-900 outline-none cursor-pointer rounded-md bg-gray-100 h-10 ${
                  invalidFields.includes('assignedBy') ? 'border-red-500' : ''
                }`}
                value={
                  options1.find(option => option.value === courseData.assignedBy) ??
                  options1[0] // Set default to the first option if no value is selected
                }
                onChange={handleInstructorChange}
                options={options1}
                classNamePrefix="react-select"
                styles={customStyles(false)}
              />
            </div>
          </div>
            <div className="ml-5 mr-5 mt-5">
              <label htmlFor="name" className="block text-sm font-medium text-gray-900 ml-2 mb-4">
              {t('add_courses.course_name')}:
              </label>
              <input
                type="text"
                name="name"
                value={courseData.name}
                onChange={handleInputChange}
                className={`w-full border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5 h-10 ${
                  invalidFields.includes('name') ? 'border-red-500' : ''
                }`}
                placeholder={`${t('add_courses.course_name')} ${t('add_courses.cant_be_blank')}`}

            />
          </div>
          <div className="ml-5 mr-5 mt-4">
            <label htmlFor="summary" className="block mb-4 text-sm font-medium text-gray-900 ml-2">{t('add_courses.summary')}:</label>
            <textarea
              name="summary"
              value={courseData.summary}
              onChange={handleInputChange}
              rows={3}
              className="w-full border rounded-md px-3 py-2 resize-none text-gray-900 h-10"
              placeholder={`${t('add_courses.summary')} ${t('add_courses.cant_be_blank')}`}
            />
          </div>
          <div className="ml-5 mr-5 mt-3">
            <label htmlFor={'description'} className="block text-sm font-medium text-gray-900 ml-2">
              {t('add_courses.description')}:
            </label>
            {courseData.descriptionParts?.map((description, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-grow">
                  <input
                    id={`description${index + 1}`}
                    name={`descriptionPart${index + 1}`}
                    value={description}
                    onChange={(e) => handleInputChange(e)}
                    className="w-full border rounded-md px-3 py-2 mt-4 text-gray-900 h-10"
                    placeholder={`${t('add_courses.description_part')} ${index + 1} ${t('add_courses.cant_be_blank')}`}
                  />
                </div>
                <button className="ml-3 btn bg-red-500 hover:bg-red-400 p-2 rounded-sm mt-4">
                  <svg
                    className="h-4 w-4 fill-current text-white cursor-pointer"
                    viewBox="0 0 16 16"
                    onClick={() => {
                      removeInput(index)
                      toast.success(t('add_courses.description_part_deleted_successfully', { index: index + 1 }))
                    }}
                  >
                    <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                  </svg>
                </button>
              </div>
            ))}
              <button
                type="button"
                onClick={addNewInput}
                className="btn bg-green-500 mt-5 hover:bg-green-400 p-1.5 rounded-sm ml-2"
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
              </button>
            </div>
            {/* <div className="w-1/2 ml-5 mr-5 hidden">
              <label htmlFor="AssignedBy" className="block mb-5 text-sm font-medium text-gray-900 mt-2">
                Assigned By:
              </label>
              <input
                type="number"
                name="assignedBy"
                readOnly
                value={courseData.assignedBy}
                onChange={handleInputChange}
                className={` border text-gray-900 text-sm rounded-lg hidden focus:ring-blue-500 focus:border-blue-500 w-full p-2.5 mt-4 ${
                  invalidFields.includes('assignedBy') ? 'border-red-500' : ''
                }`}
                placeholder='assignedBy is required'
              />
            </div> */}
          <div className="lg:flex md:flex">
            {/* Start Date */}
            <div className="md:w-1/2 ml-5 mr-5 mt-4">
              <label
                htmlFor="startDate"
                className="block mb-4 text-sm font-medium text-gray-900 w-full ml-2"
              >
                {t('add_courses.start_date')}:
              </label>
              <div className="relative">
                <DatePicker
                  key={`start-${i18n.language}`}
                  selected={tempStartDate}
                  onChange={(date: Date | null) => handleDateChange(date, 'startDate')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat={dateTimeFormat}
                  locale={locale}
                  timeCaption={(t('picker.time_caption') ?? '')}
                  placeholderText={t('picker.placeholder_public_date') ?? ''}
                  className={`w-full border rounded-md px-3 py-2 text-gray-900 h-10 ${
                    invalidFields.includes('startDate') ? 'border-red-500' : ''
                  }`}
                  wrapperClassName="w-full"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarMonthIcon className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>

            {/* End Date */}
            <div className="md:w-1/2 ml-5 mr-5 mt-4">
              <label htmlFor="endDate" className="block mb-4 text-sm font-medium text-gray-900 w-full">
              {t('add_courses.end_date')}:
              </label>
              <div className="relative">
              <DatePicker
                key={`end-${i18n.language}`}
                selected={tempEndDate}
                onChange={(date: Date | null) => handleDateChange(date, 'endDate')}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={dateTimeFormat}
                locale={locale}
                timeCaption={(t('picker.time_caption') ?? '')}
                placeholderText={t('picker.placeholder_public_date') ?? ''}
                className={`border rounded-md px-3 py-2 w-full text-gray-900 h-10 ${
                  invalidFields.includes('endDate') ? 'border-red-500' : ''
                }`}
                wrapperClassName="w-full"
              />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarMonthIcon className="text-gray-400 w-5 h-5" />
                </div>
              </div>
            </div>
          </div>
          <div className="lg:flex md:flex mt-5">
            {/* thẻ hiển thị giá trị price */}
            {/* <div className="md:w-1/2 ml-5 mr-5 hidden">
              <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 mt-4">
                Price:
              </label>
              <input
                type="number"
                name="price"
                value={courseData.price}
                onChange={handleInputChange}
                className={` border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                  invalidFields.includes('price') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder='Price is required '
              />
            </div> */}
          </div>
            <div className="ml-5 mr-5">
            <label htmlFor={'preparePart'} className="block text-sm font-medium text-gray-900 mb-3 ml-2">
            {t('add_courses.prepare')}:
            </label>
            {courseData.prepareParts?.map((part, index) => (
              <div key={index} className="flex items-center">
                <div className="flex-grow">
                  <input
                    type="text"
                    name={`preparePart${index + 1}`}
                    value={courseData.prepareParts?.[index] ?? ''} // Optional chaining and fallback value
                    onChange={handleInputChange}
                    className="w-full border rounded-md px-3 py-2 mb-5 text-gray-900 h-10"
                    placeholder={`${t('add_courses.prepare_part')} ${index + 1} ${t('add_courses.cant_be_blank')}`}
                  />
                </div>
                <button className="ml-3 btn bg-red-500 hover:bg-red-400 p-2 rounded-sm mb-5">
                  <svg
                    className="h-4 w-4 fill-current text-white cursor-pointer"
                    viewBox="0 0 16 16"
                    onClick={() => {
                      removeInputprepareParts(index)
                      // toast.success(t('add_courses.prepare_part_deleted_successfully', { index: index + 1 }))
                    }}
                  >
                    <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addPreparePart}
              className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm ml-2"
            >
              <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </button>
          </div>
          <div className="ml-5 mr-5 mt-4">
            <label htmlFor="durationInMinute" className="block mb-4 text-sm font-medium text-gray-900 ml-2">
                {t('add_courses.duration_in_minutes')}:
              </label>
              <input
                type="number"
                name="durationInMinute"
                value={courseData.durationInMinute}
                onChange={handleInputChange}
                className={`border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-5 h-10 ${
                  invalidFields.includes('durationInMinute') ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder={`${t('add_courses.duration_in_minutes')} ${t('add_courses.cant_be_blank')}`}
              />
           </div>
          <div className="lg:flex md:flex ">
           <div className="md:w-1/2 block ml-5 mr-5 mt-4">
              <label htmlFor="locationPath" className="block mb-5 text-sm font-medium text-gray-900 ml-2">
                {t('add_courses.upload_image')}:
              </label>
              <Controller
                control={control}
                name="locationPath"
                render={({ fieldState: { error } }) => (
                  <UploadFiles
                    maxFiles={MAX_NUMER_OF_FILES}
                    multiple
                    maxSize={MAX_FILE_SIZE}
                    accept={getAcceptedFileTypes()}
                    onDrop={handleChangeFile}
                    errorMessage={error?.message}
                    borderError={invalidFields.includes('locationPath')} // Thêm thuộc tính borderError
                  />
                )}
              />
              <PreviewFiles
                fileList={watch('locationPath')}
                onRemoveFile={handleRemoveFile}
                className="mt-6"
              />
            </div>
            <div className="md:w-1/2 block ml-5 mr-5 mt-5">
              <div className="flex items-center">
                <label htmlFor="checkboxPublic" className="block text-sm font-medium text-gray-900 mr-2">{t('add_courses.status')}:</label>
                <input
                  type="checkbox"
                  name="checkboxPublic"
                  checked={isChecked}
                  onChange={handleCheckboxChange}
                  className="ml-5 mt-2"
                />
              </div>
              {isChecked && (
                <div className="flex flex-col mt-5">
                  <div className="flex items-center">
                    <input
                      type="radio"
                      name="publicStatus"
                      value="hidden"
                      checked={courseData.publicStatus === 2}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <label htmlFor="publicStatus" className="ml-2 text-sm font-medium text-gray-900 ">
                      {t('add_courses.public_now')}:
                    </label>
                  </div>
                  <div className="flex items-center mb-2">
                    <input
                      type="radio"
                      name="publicStatus"
                      value="publicDate"
                      checked={courseData.publicStatus === 1}
                      onChange={handleRadioChange}
                      className="mr-2"
                    />
                    <div className="flex items-center gap-3 ml-2">
                      <label
                        htmlFor="publicStatus"
                        className="text-sm font-medium text-gray-900 whitespace-nowrap"
                      >
                        {t('add_courses.public_appointment')}:
                      </label>
                     <div className="relative w-48">
                      <DatePicker
                        key={`public-${i18n.language}`}
                        selected={tempPublicDate}
                        onChange={(date: Date | null) => handleDateChange(date, 'publicDate')}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat={dateTimeFormat}
                        locale={locale}
                        timeCaption={(t('picker.time_caption') ?? '')}
                        placeholderText={t('picker.placeholder_public_date') ?? ''}
                        className={`w-full border rounded-md px-3 py-2 text-gray-900 h-10 ${
                          invalidFields.includes('publicDate') ? 'border-red-500' : ''
                        } `}
                        wrapperClassName="w-full"
                        popperClassName="!w-96 !max-w-none"
                        popperPlacement="bottom-start"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                          <CalendarMonthIcon className="text-gray-400 w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={notifyUsers}
                      name="notifyUsers"
                      onChange={(e) => setNotifyUsers(e.target.checked)}
                      className="mb-5 mr-2"
                    />
                    <div className="flex items-center gap-3 ml-2">
                      <label className="block text-sm font-medium text-gray-900 mb-5">{t('add_courses.notify_users')}</label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end mb-2">
            <button className="bg-gray-300 text-black px-4 py-2 rounded-full mr-2 hover:bg-gray-400 hover:text-black border border-gray-300 min-w-[100px]" onClick={handleCancel}>{t('add_courses.cancel')}</button>
            <button
              onClick={handleAddCourse}
              className="bg-teal-400 text-white font-bold py-2 px-4 hover:bg-teal-500 rounded-full border border-teal-500 mr-4"
            >
              {t('add_courses.save')}
            </button>
          </div>
        </tbody>
      </table>
    </div>
  )
}

export default AddCourse
