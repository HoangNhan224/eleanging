/* eslint-disable @typescript-eslint/no-base-to-string */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
// PAGE: COURSE
//    ========================================================================== */
// PAGE: COURSE
//    ========================================================================== */
import React, { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { updateCourse, getCourseById, getCategoryCourseData, fetchAllUser } from 'api/post/post.api'
import { toast } from 'react-toastify'
import { FileRejection, ErrorCode as DropzoneErrorCode, Accept } from 'react-dropzone'
import { Controller, useForm } from 'react-hook-form'
import { v4 as uuidv4 } from 'uuid'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import Select from 'react-select'
import {
  getBase64,
  getVideoCover
} from '../../utils/fileconfig'
import PreviewFiles from '../../components/PreviewFiless'
import UploadFiles from '../../components/UploadFiles'
import { IUploadFile } from '../../api/interfaces'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useTranslation } from 'react-i18next'
import { useDatePickerLocale } from '../../hooks/useDatePickerLocale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
interface Course {
  id: string
  categoryCourseId: number
  name: string
  summary: string
  assignedBy: number
  durationInMinute: number
  startDate: string
  endDate: string
  description: string
  locationPath: string | File
  prepare: string
  price: string
  publicStatus: number
  publicDate: string | null
}
interface IForm {
  locationPath: IUploadFile[]
}

// Define constants for maximum file size and the maximum number of files that can be uploaded
const MAX_FILE_SIZE = 1024 * 1024 * 5 // 5MB
const MAX_NUMER_OF_FILES = 1 // Only 1 file can be uploaded

// Define a form validation schema using the `zod` library to validate the uploaded file
const FormValidationSchema = z.object({
  locationPath: z.array(z.instanceof(File)) // Ensure locationPath is an array of File instances
    .min(1, 'Vui lòng chọn file!') // Validation rule: At least 1 file must be selected, otherwise show the message "Vui lòng chọn file!"
})

interface ErrorState {
  nameExists: boolean
}
interface User {
  id: number
  username: string
}
interface Category {
  id: number
  name: string
}

const EditCourse = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { locale, dateTimeFormat } = useDatePickerLocale()
  const [dataCategory, setDataCategory] = useState<Category[] | null>(null)
  const [courseData, setCourseData] = useState<Course | null>(null)
  const [invalidFields, setInvalidFields] = useState<string[]>([])
  const [errorState, setErrorState] = useState<ErrorState>({ nameExists: false })
  const [statusChecked, setStatusChecked] = useState<boolean>(false)
  const [publicChecked, setPublicChecked] = useState<boolean>(false)
  const [newImage] = useState<File | null>(null)
  const [hasError, setHasError] = useState(false)
  const [prepareParts, setPrepareParts] = useState<string[]>([])
  const [descriptionParts, setDescriptionParts] = useState<string[]>([])
  const [dataUser, setDataUser] = useState<User[] | null>(null)
  const [tempStartDate, setTempStartDate] = useState<string | null>(null)
  const [tempEndDate, setTempEndDate] = useState<string | null>(null)
  const [tempPublicDate, setTempPublicDate] = useState<string | null>(null)
  const [isSaveClicked, setIsSaveClicked] = React.useState(false)
  const { id } = useParams<{ id?: string }>()
  useEffect(() => {
    if (courseData) {
      // Destructure the prepare field from courseData
      const { prepare } = courseData

      // Split the prepare field by ';;' to generate multiple input fields based on its content
      // If prepare is empty or null, default to an array with an empty string
      const prepareParts = prepare ? prepare.split(';;') : ['']

      // Destructure the description field from courseData
      const { description } = courseData

      // Split the description field by ';;' to generate multiple input fields based on its content
      // If description is empty or null, default to an array with an empty string
      const descriptionParts = description ? description.split(';;') : ['']

      // Update the state with the split parts for prepare and description fields
      setPrepareParts(prepareParts)
      setDescriptionParts(descriptionParts)

      // Handle logic related to publicStatus from courseData
      const { publicStatus } = courseData
      console.log('Initial publicStatus:', publicStatus)

      // Set the checkbox state based on publicStatus
      // If publicStatus is not 0, check the status checkbox
      setStatusChecked(publicStatus !== 0)

      // If publicStatus is 1 or 2, check the public checkbox
      setPublicChecked(publicStatus === 1 || publicStatus === 2)

      // If publicStatus is 2, ensure the public checkbox is unchecked, as "Hidden" is selected
      if (publicStatus === 2) {
        setPublicChecked(false) // Chọn radio "Hidden"
      }
    }
  }, [courseData]) // Re-run the effect when courseData changes

  const handleStatusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    console.log('handleStatusChange - checked:', checked)
    setStatusChecked(checked)

    if (!checked) {
      setPublicChecked(false)
      setCourseData(prevState => ({
        ...(prevState as Course),
        publicStatus: 0,
        publicDate: '' // Set publicDate to null when status is unchecked
      }))
    } else if (publicChecked) {
      setCourseData(prevState => ({
        ...(prevState as Course),
        publicStatus: 1
      }))
    } else {
      setCourseData(prevState => ({
        ...(prevState as Course),
        publicStatus: 2
      }))
    }
    console.log('handleStatusChange - new courseData:', courseData)
  }
  const removeInputprepareParts = (indexToRemove: number) => {
    // If there's only one element left in the array, do not allow deletion
    if (prepareParts.length === 1) {
      toast.error(t('edit_courses.you_can_not_delete_the_last_prepare_part')) // Display an error message
      return // Exit the function to prevent deletion
    }
    setPrepareParts((prevParts) => {
      const updatedParts = prevParts.filter((_, index) => index !== indexToRemove)
      // Log the updated prepareParts after removal
      console.log('Updated prepareParts:', updatedParts)
      // Concatenate the remaining parts to update `prepare`
      const updatedPrepare = updatedParts.join(';;') // Ensure delimiter is consistent
      // Log the updated `prepare` string
      console.log('Updated prepare string:', updatedPrepare)
      // Update courseData with the new `prepare` value
      setCourseData((prevCourseData) => {
        if (!prevCourseData) {
          return null // Handle the case where courseData is null
        }
        const newCourseData = {
          ...prevCourseData,
          prepare: updatedPrepare // Update the prepare field
        }
        return newCourseData
      })
      return updatedParts
    })
    // toast.success(`${t('edit_courses.prepare_part')} ${indexToRemove + 1} ${t('edit_courses.successfully_deleted')}`) // Show success message
  }
  const removeInputDescriptionParts = (indexToRemove: number) => {
    // Check if there is only one element left in the descriptionParts array; if so, prevent deletion
    if (descriptionParts.length === 1) {
      toast.error(t('edit_courses.you_can_not_delete_the_last_description_part')) // Display an error message
      return
    }

    // Update the descriptionParts state by filtering out the part to remove
    setDescriptionParts((prevParts) => {
      // Filter the previous parts to create a new array without the part at indexToRemove
      const updatedParts = prevParts.filter((_, index) => index !== indexToRemove)

      // Log the updated descriptionParts after removal for debugging
      console.log('Updated descriptionParts:', updatedParts)

      // Concatenate the remaining parts into a single string, separated by ';;'
      const updatedDescription = updatedParts.join(';;') // Ensure delimiter is consistent

      // Log the updated description string for debugging
      console.log('Updated description string:', updatedDescription)

      // Update the courseData with the new description value
      setCourseData((prevCourseData) => {
        if (!prevCourseData) {
          return null // Handle the case where courseData is null
        }
        // Create a new courseData object with the updated description
        const newCourseData = {
          ...prevCourseData,
          description: updatedDescription // Update the description field
        }
        return newCourseData // Return the updated courseData
      })

      // Return the updated parts for the descriptionParts state
      return updatedParts
    })

    // Show a success message after successful deletion
    // toast.success(`${t('edit_courses.description_part')} ${indexToRemove + 1} ${t('edit_courses.successfully_deleted')}`) // Show success message
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
  }
  const handleChangeFile = async (
    acceptedFiles: File[],
    fileRejections: FileRejection[]
  ) => {
    // Calculate the total number of files including accepted and rejected files
    const totalFiles =
      getValues('locationPath').length + acceptedFiles.length + fileRejections.length

    // If there are rejected files or the total number of files exceeds the max limit, handle errors
    if (fileRejections.length || totalFiles > MAX_NUMER_OF_FILES) {
      // Get the error code from the first rejected file
      const errorCode = fileRejections[0]?.errors?.[0]?.code
      setHasError(true) // Set the error state to true for handling elsewhere

      // Handle too many files error
      if (
        errorCode === DropzoneErrorCode.TooManyFiles ||
        totalFiles > MAX_NUMER_OF_FILES
      ) {
        toast.error(`${t('edit_courses.you_can_only_upload')} ${MAX_NUMER_OF_FILES} ${t('edit_courses.file')}`, {
          progress: undefined
        }) // Show error message for exceeding the file limit
      } else if (errorCode === DropzoneErrorCode.FileInvalidType) {
        // Handle unsupported file type error
        toast.error(t('edit_courses.file_format_is_not_supported'), {
          progress: undefined
        }) // Show error message for unsupported file types
      } else if (errorCode === DropzoneErrorCode.FileTooLarge) {
        // Handle file size limit error
        toast.error(
          t('edit_courses.you_can_only_upload_file_up_to_5MB'),
          {
            progress: undefined
          }
        ) // Show error message for large files
      }
      return // Exit if there are errors
    } else {
      setHasError(false) // Reset the error state if no errors
    }
    // Create a list of promises to handle file preview generation for images and videos
    const acceptedFileListWithPreview: Array<Promise<IUploadFile>> =
      acceptedFiles.map(async (file) => ({
        uid: uuidv4(), // Generate a unique ID for each file
        originalFileObj: file, // Store the original file object
        preview: await (file.type.includes('image') // Generate a preview based on file type
          ? getBase64(file) // For images, use getBase64 to generate a preview
          : getVideoCover(file)) // For videos, generate a cover image
      }))
    // Once all file previews are ready, update the form field 'locationPath' with the new files
    Promise.all(acceptedFileListWithPreview).then((results) =>
      setValue('locationPath', [...getValues('locationPath'), ...results], {
        shouldValidate: true, // Trigger validation
        shouldDirty: true // Mark the form field as dirty (modified)
      })
    )
  }
  const getAcceptedFileTypes = (): Accept => {
    return {
      'image/png': ['.png'],
      'image/jpeg': ['.jpeg', '.jpg']
    }
  }

  const handlePublicRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (statusChecked) {
      setPublicChecked(true)
      setCourseData(prevState => ({
        ...(prevState as Course),
        publicStatus: 1,
        publicDate: ''
      }))
    }
  }

  const handleHiddenRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (statusChecked) {
      setPublicChecked(false)
      setCourseData(prevState => ({
        ...(prevState as Course),
        publicStatus: 2,
        publicDate: ''
      }))
    }
  }
  // Function to handle changes in the preparation parts input fields
  const handlePreparePartChange = (
    e: React.ChangeEvent<HTMLInputElement>, // Event for input change
    index: number // Index of the preparation part being updated
  ) => {
    // Create a copy of the current prepareParts array
    const newPrepareParts = [...prepareParts]

    // Update the specific index in the new array with the new input value
    newPrepareParts[index] = e.target.value
    setPrepareParts(newPrepareParts) // Update the state with the modified array

    // Concatenate the updated parts into a single string using ';;' as the delimiter
    const newPrepare = newPrepareParts.join(';;')

    // Update the prepare field in courseData with the new concatenated string
    setCourseData((prevState) => ({
      ...(prevState as Course), // Ensure type consistency with Course
      prepare: newPrepare // Update the prepare field with the new value
    }))
  }

  const handleDescriptionPartChange = (
    e: React.ChangeEvent<HTMLInputElement>, // Event for handling input changes
    index: number // Index of the description part being updated
  ) => {
    // Create a copy of the current descriptionParts array
    const newDescriptionParts = [...descriptionParts]

    // Update the specific part in the array with the new value from the input
    newDescriptionParts[index] = e.target.value

    // Update the state with the new description parts
    setDescriptionParts(newDescriptionParts)

    // Concatenate the updated description parts into a single string with ';;' as the delimiter
    const newDescription = newDescriptionParts.join(';;')
    // Update courseData with the new concatenated description
    setCourseData((prevState) => ({
      ...(prevState as Course), // Spread the previous state to retain other course data
      description: newDescription // Update the description field with the new value
    }))
  }
  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        if (id) {
          const response = await getCourseById({ id })
          const fetchedCourseData = response.data

          // Create a new object without the publicDate property if publicStatus is 0
          const updatedCourseData = (fetchedCourseData.publicStatus === 0 || fetchedCourseData.publicStatus === 2)
            ? { ...fetchedCourseData, publicDate: null } // Set publicDate to null
            : fetchedCourseData

          setCourseData(updatedCourseData)

          const { publicStatus } = fetchedCourseData
          console.log('publicStatus:', publicStatus)
        }
      } catch (error) {
        console.error(t('edit_courses.failed_to_load_course_data'), error)
      }
    }

    fetchCourseData()
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target // Extract the name and value from the input change event.

    // Validate the input value: process only if the value is a valid date or an empty string.
    const date = new Date(value)
    if (!isNaN(date.getTime()) || value === '') {
      // Update the course data with the new value (set to null if empty).
      setCourseData((prevState) => ({
        ...(prevState as Course), // Copy the previous state.
        [name]: value || null // Update the specific field with the new value.
      }))
    }

    // Handle temporary updates for specific date fields.
    if (name === 'startDate') {
      setTempStartDate(value) // Update the temporary value for the start date.
    } else if (name === 'endDate') {
      setTempEndDate(value) // Update the temporary value for the end date.
    } else if (name === 'publicDate') {
      setTempPublicDate(value) // Update the temporary value for the public date.
    }

    // Update the course data state for all fields.
    setCourseData((prevState) => ({
      ...(prevState as Course), // Copy the current state.
      [name]: value // Set the new value for the specific field.
    }))
    // Xóa trường 'name' khỏi invalidFields nếu người dùng nhập giá trị
    if (name === 'name' && invalidFields.includes('name') && value.trim() !== '') {
      setInvalidFields((prev) => prev.filter((field) => field !== 'name'))
    }
    if (name === 'durationInMinute' && invalidFields.includes('durationInMinute') && value.trim() !== '') {
      setInvalidFields((prev) => prev.filter((field) => field !== 'durationInMinute'))
    }

    // Xóa trạng thái lỗi trùng tên khi người dùng nhập liệu
    if (name === 'name' && errorState.nameExists) {
      setErrorState((prev) => ({
        ...prev,
        nameExists: false
      }))
    }

    // Remove the current field from the list of invalid fields (if it exists there).
    setInvalidFields((prevState) => prevState.filter((field) => field !== name))
  }
  const handleCancel = () => {
    navigate('/course')
  }

  const handleCategoryChange = (selectedOption: { value: number, label: string } | null) => {
    // Check if a valid option is selected.
    if (selectedOption) {
      // Update the `categoryCourseId` field in the course data state with the selected value.
      setCourseData((prevState) => ({
        ...(prevState as Course), // Copy the existing course data state.
        categoryCourseId: selectedOption.value // Update the category ID with the selected option's value.
      }))
    }

    // Remove `categoryCourseId` from the list of invalid fields if it exists.
    setInvalidFields((prevState) => prevState.filter((field) => field !== 'categoryCourseId'))
  }
  const categoryNames = dataCategory?.map((item: Category) => ({ id: item.id, name: item.name })) ?? []
  const categoryOptions = categoryNames.map((category: Category) => ({
    value: category.id,
    label: category.name
  }))

  // Function to validate the fields of the Course data object
  const validateFields = (data: Course) => {
    // Check if categoryCourseId is 0, meaning no category is selected
    if (data.categoryCourseId === 0) {
      toast.error(t('edit_courses.please_select_a_category_for_the_course')) // Show error message
      return ['categoryCourseId'] // Return the field that failed validation
    }

    // Check if assignedBy is 0, meaning no instructor is selected
    if (data.assignedBy === 0) {
      toast.error(t('edit_courses.please_select_an_Instructor_for_the_course')) // Show error message
      return ['assignedBy'] // Return the field that failed validation
    }

    // Check if the course name is empty
    if (data.name.trim() === '') {
      toast.error(t('edit_courses.name_is_required')) // Show error message
      return ['name'] // Return the field that failed validation
    }

    // Check if durationInMinute is empty
    if (String(data.durationInMinute).trim() === '') {
      toast.error(t('edit_courses.duration_is_required')) // Show error message
      return ['durationInMinute'] // Return the field that failed validation
    }

    // Check if startDate is empty
    if (!data.startDate || data.startDate.trim() === '') {
      toast.error(t('edit_courses.startDate_is_required')) // Show error message
      return ['startDate'] // Return the field that failed validation
    }

    // Check if endDate is empty
    if (!data.endDate || data.endDate.trim() === '') {
      toast.error(t('edit_courses.endDate_is_required')) // Show error message
      return ['endDate'] // Return the field that failed validation
    }

    // Check if startDate is after or equal to endDate
    if (data.startDate >= data.endDate) {
      toast.error(t('edit_courses.end_date_must_be_after_start_date')) // Show error message
      return ['endDate'] // Return the field that failed validation
    }
    // Check if the durationInMinute is a valid number
    if (!/^\d+$/.test(String(data.durationInMinute))) {
      toast.error(t('edit_courses.duration_must_be_positive_integer')) // Show error message
      return ['durationInMinute'] // Return the field that failed validation
    }
    // Kiểm tra nếu durationInMinute <= 1
    if (data.durationInMinute < 1) {
      toast.error(t('edit_courses.duration_must_be_positive_integer')) // Show error message
      return ['durationInMinute'] // Return the field that failed validation
    }
    // Check if price is empty
    // if (data.price.trim() === '') {
    //   toast.error('Price is required')  // Show error message
    //   return ['price']  // Return the field that failed validation
    // }

    // Check if price is a valid number (decimal format allowed)
    // if (!/^\d+(\.\d+)?$/.test(data.price.trim())) {
    //   toast.error('Price must be a valid number')  // Show error message
    //   return ['price']  // Return the field that failed validation
    // }

    // If publicStatus is 1 (meaning course is public), validate the publicDate field
    if (data.publicStatus === 1) {
      if (!data.publicDate || data.publicDate.trim() === '') {
        toast.error(t('edit_courses.publicDate_is_required')) // Show error message
        return ['publicDate'] // Return the field that failed validation
      }
    }

    // If all validations pass, return an empty array (no errors)
    return []
  }

  const handleUpdateCourse = async () => {
    setIsSaveClicked(true)
    if (!id || !courseData) {
      toast.error(t('edit_courses.invalid_course_data'))
      return
    }

    const invalid = validateFields(courseData)
    setInvalidFields(invalid)
    if (invalid.length > 0) {
      return
    }

    // Remove empty parts and eliminate unnecessary ';;' in the prepare and description fields
    const cleanedPrepare = courseData.prepare
      .split(';;') // Split the prepare string by ';;' to get an array of parts
      .filter((part) => part.trim() !== '') // Filter out any empty or whitespace-only parts
      .join(';;') // Join the remaining parts back into a string with ';;' as the delimiter

    const cleanedDescription = courseData.description
      .split(';;') // Split the description string by ';;' to get an array of parts
      .filter((part) => part.trim() !== '') // Filter out any empty or whitespace-only parts
      .join(';;') // Join the remaining parts back into a string with ';;' as the delimiter

    // Update courseData with the cleaned prepare and description strings
    const updatedCourseData = {
      ...courseData, // Spread the existing courseData object
      prepare: cleanedPrepare, // Assign the cleaned prepare string
      description: cleanedDescription // Assign the cleaned description string
    }
    // Nếu statusChecked là false, đặt publicDate là null
    if (!statusChecked) {
      updatedCourseData.publicDate = null
    } else if (updatedCourseData.publicStatus === 2) {
      updatedCourseData.publicDate = new Date().toLocaleString()
    }
    const formData = new FormData()
    formData.append('categoryCourseId', String(updatedCourseData.categoryCourseId))
    formData.append('name', updatedCourseData.name)
    formData.append('summary', updatedCourseData.summary)
    formData.append('assignedBy', String(updatedCourseData.assignedBy))
    formData.append('durationInMinute', String(updatedCourseData.durationInMinute))
    formData.append('startDate', updatedCourseData.startDate)
    formData.append('endDate', updatedCourseData.endDate)
    formData.append('description', updatedCourseData.description)
    formData.append('prepare', updatedCourseData.prepare)
    formData.append('price', String(updatedCourseData.price))
    formData.append('publicStatus', String(updatedCourseData.publicStatus))
    if (updatedCourseData.publicDate) {
      formData.append('publicDate', updatedCourseData.publicDate)
    }

    const selectedFiles = watch('locationPath')
    if (!selectedFiles && !updatedCourseData.locationPath) {
      toast.error(t('edit_courses.location_path_is_required')) // Show error message
      return
    }

    if (selectedFiles && selectedFiles.length > 0) {
      formData.append('locationPath', selectedFiles[0].originalFileObj)
    } else if (typeof updatedCourseData.locationPath === 'string') {
      formData.append('locationPath', updatedCourseData.locationPath)
    }

    try {
      await updateCourse(id, formData)
      toast.success(t('edit_courses.course_update_successfully'))
      navigate('/course')
    } catch (error) {
      const responseError = error as { message?: string }
      if (responseError.message === 'Course name already exists.') {
        setErrorState(prevState => ({ ...prevState, nameExists: true }))
        toast.error(t('edit_courses.course_name_already_exists')) // Show error message for duplicate course name
      } else {
        toast.error(t('edit_courses.failed_to_update_course')) // Show error message for course update failure
      }
    }
  }

  const fetchData = useCallback(async () => {
    try {
      const response = await getCategoryCourseData()
      setDataCategory(response.data)
      const response1 = await fetchAllUser()
      // console.log('checkkkkkkkkkkkkkkkkkkkkkkkkkkkkkasddddd', response1.data)
      setDataUser(response1.data)
    } catch (error) {
      setDataCategory(null)
      setDataUser(null)
    }
  }, [])
  const handleDatePickerChange = (date: Date | null, fieldName: string) => {
    if (!date) {
      setInvalidFields((prevState) => [...prevState, fieldName])
      setCourseData((prevState) => ({
        ...(prevState as Course),
        [fieldName]: null // Xóa ngày
      }))

      if (fieldName === 'startDate') {
        setTempStartDate(null) // Xóa ngày tạm thời
      }
      return
    }

    const formattedDate = date.toISOString() // Hoặc định dạng khác theo nhu cầu
    setCourseData((prevState) => ({
      ...(prevState as Course),
      [fieldName]: formattedDate
    }))

    if (fieldName === 'startDate') {
      setTempStartDate(formattedDate)
    } else if (fieldName === 'endDate') {
      setTempEndDate(formattedDate)
    } else if (fieldName === 'publicDate') {
      setTempPublicDate(formattedDate)
    }

    setInvalidFields((prevState) => prevState.filter((field) => field !== fieldName))
  }
  const parseDate = (dateString: string | null) => {
    if (!dateString) return null
    const parsedDate = new Date(dateString)
    return isNaN(parsedDate.getTime()) ? null : parsedDate
  }

  useEffect(() => {
    fetchData()
  }, [fetchData])
  const handleAssignedByChange = (selectedOption: { value: number, label: string } | null) => {
    if (selectedOption) {
      setCourseData((prevState) => ({
        ...(prevState as Course),
        assignedBy: selectedOption.value
      }))
    }
    setInvalidFields((prevState) => prevState.filter((field) => field !== 'assignedBy'))
  }
  const assignedByOptions = dataUser?.map((item: User) => ({
    value: item.id,
    label: item.username
  })) ?? []
  const customStyles = (isError: boolean) => ({
    control: (provided: any, state: any) => ({
      ...provided,
      height: '2.5 rem',
      borderColor: isError ? 'red' : state.isFocused ? 'gray' : provided.borderColor,
      boxShadow: isError ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px gray' : provided.boxShadow,
      '&:hover': {
        borderColor: isError ? 'red' : state.isFocused ? 'gray' : provided['&:hover'].borderColor
      }
    })
  })
  return (
    <div className="flex flex-col space-y-4 mb-10">
      <div className="flex items-center mt-5 ml-5">
        <div className="w-10 h-10 mr-2 flex items-center justify-center bg-zinc-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6 text-zinc-50" // Đặt kích thước nhỏ hơn để phù hợp với khung
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
            />
          </svg>
        </div>
        <h1 className="text-4xl">{t('edit_courses.edit_course')}</h1>
      </div>
      {courseData && (
        <table className="border-2 border-gray-300 ml-5 mr-5 rounded-md">
          <tbody>
            <div className="lg:flex md:flex">
              <div className="md:w-1/2 mr-5 ml-5 mt-4">
                <label htmlFor="categoryCourseId" className="block mb-4 text-sm font-medium ml-2">
                  {t('edit_courses.category_course')}:
                </label>
                <Select
                  options={categoryOptions}
                  value={categoryOptions.find((option) => option.value === courseData.categoryCourseId) ?? null}
                  onChange={handleCategoryChange}
                  className={`w-full border text-gray-800 outline-none cursor-pointer rounded-md h-10${invalidFields.includes('categoryCourseId') ? 'border-red-500' : ''
                    }`}
                  styles={customStyles(false)}
                />
              </div>
              <div className="md:w-1/2 mr-5 ml-5 mt-4">
                <label htmlFor="assignedBy" className="block mb-4 text-sm font-medium ml-2">
                  {t('edit_courses.instructor')}:
                </label>
                <Select
                  options={assignedByOptions}
                  value={assignedByOptions.find((option) => option.value === courseData.assignedBy) ?? null}
                  onChange={handleAssignedByChange}
                  className={`w-full text-gray-800 outline-none cursor-pointer rounded-md border h-10${invalidFields.includes('assignedBy') ? 'border-red-500' : ''
                    }`}
                  styles={customStyles(false)}
                />
              </div>
            </div>
            <div className="ml-5 mr-5 mt-4">
              <label
                htmlFor="name"
                className="block mb-4 ml-2 text-sm font-medium"
              >
                {t('edit_courses.course_name')}:
              </label>
              <input
                type="text"
                name="name"
                value={courseData.name}
                onChange={handleInputChange}
                className={`w-full text-gray-900 border-gray-300 rounded-md px-3 py-2 border h-10 ${invalidFields.includes('name') || errorState.nameExists ? 'border-red-500' : ''
                  }`}
                  placeholder={
                    invalidFields.includes('name')
                      ? `${t('edit_courses.course_name')} ${t('edit_courses.cant_be_blank')}`
                      : `${t('edit_courses.course_name')}`
                  } />
            </div>

            <div className="ml-5 mr-5 mt-4">
              <label htmlFor="summary" className="block text-sm font-medium ml-2 mb-5">{t('edit_courses.summary')}:</label>
              <textarea
                name="summary"
                value={courseData.summary}
                onChange={handleInputChange}
                rows={3}
                className="text-gray-900 w-full border rounded-md px-3 py-2 resize-none"
                placeholder={`${t('edit_courses.summary')} ${t('edit_courses.cant_be_blank')}`}
              />
            </div>
            <div className="ml-5 mr-5 mt-3">
              <label className="block text-sm font-medium ml-2 mb-5">
                {t('edit_courses.description')}:
              </label>
              {descriptionParts.map((part, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <input
                      name={`descriptionPart${index + 1}`}
                      value={part}
                      onChange={(e) => handleDescriptionPartChange(e, index)}
                      className="text-gray-900 w-full border p-4 rounded px-3 py-2 mb-6 h-10"
                      placeholder={`${t('edit_courses.description_part')} ${index + 1} ${t('edit_courses.cant_be_blank')}`}
                      />
                  </div>
                  <button className="ml-3 btn bg-red-500 hover:bg-red-400 p-2 rounded-sm mb-6">
                    <svg
                      className="h-4 w-4 fill-current text-white cursor-pointer"
                      viewBox="0 0 16 16"
                      onClick={() => {
                        removeInputDescriptionParts(index)
                      }}
                    >
                      <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                    </svg>
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => {
                  setDescriptionParts([...descriptionParts, ''])
                }}
                className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm ml-2"
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
              </button>
            </div>
            <div className="ml-5 mr-5 mt-4">
              <label
                htmlFor="durationInMinute"
                className="block text-sm font-medium ml-2 mb-5"
              >
                {t('edit_courses.duration_in_minutes')}:
              </label>
              <input
                type="number"
                name="durationInMinute"
                value={courseData.durationInMinute}
                onChange={handleInputChange}
                className={`text-gray-900 border text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 h-10 ${invalidFields.includes('durationInMinute') ? 'border-red-500' : ''
                  }`}
                  placeholder={`${t('edit_courses.duration_in_minutes')} ${t('edit_courses.cant_be_blank')}`}
                  />
            </div>

            <div className="lg:flex md:flex">
              {/* Start Date */}
              <div className="md:w-1/2 ml-5 mr-5 mt-4">
                <label htmlFor="startDate" className="block mb-5 text-sm font-medium ml-2">
                  {t('edit_courses.start_date')}:
                </label>
               <div className="relative">
                <DatePicker
                  key={`start-${i18n.language}`}
                  selected={
                    tempStartDate
                      ? parseDate(tempStartDate)
                      : courseData?.startDate
                        ? parseDate(courseData.startDate)
                        : null
                  }
                  onChange={(date: Date | null) => handleDatePickerChange(date, 'startDate')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat={dateTimeFormat}
                  locale={locale}
                  timeCaption={(t('picker.time_caption') ?? '')}
                  placeholderText={t('picker.placeholder_public_date') ?? ''}
                  className={`text-gray-900 w-full border rounded-md px-3 py-2 h-10 ${isSaveClicked && invalidFields.includes('startDate') ? 'border-red-500' : ''
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
                <label htmlFor="endDate" className="block mb-5 text-sm font-medium ml-2">
                  {t('edit_courses.end_date')}:
                </label>
               <div className="relative">
                <DatePicker
                  key={`end-${i18n.language}`}
                  selected={tempEndDate ? new Date(tempEndDate) : courseData?.endDate ? new Date(courseData.endDate) : null}
                  onChange={(date: Date | null) => handleDatePickerChange(date, 'endDate')}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat={dateTimeFormat}
                  locale={locale}
                  timeCaption={(t('picker.time_caption') ?? '')}
                  placeholderText={t('picker.placeholder_public_date') ?? ''}
                  className={`text-gray-900 w-full border rounded-md px-3 py-2 h-10 ${isSaveClicked && invalidFields.includes('endDate') ? 'border-red-500' : ''
                    }`}
                  wrapperClassName="w-full"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <CalendarMonthIcon className="text-gray-400 w-5 h-5" />
                </div>
              </div>
              </div>
            </div>
            {/* <div className="md:w-1/2 ml-5 mr-5 mt-2">
                <label htmlFor="price" className="block mb-2 text-sm font-medium text-gray-900 mt-2">
                  Price:
                </label>
                <input
                  type="number"
                  name="price"
                  value={courseData.price}
                  onChange={handleInputChange}
                  className={`border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 mt-4 ${
                    invalidFields.includes('price') ? 'border-red-500' : ''
                  }`}
                  placeholder='Price is equired '
                />
              </div> */}
            <div className="ml-5 mr-5 mt-5">
              <label className="block text-sm font-medium ml-2">
                {t('edit_courses.prepare')}:
              </label>
              {prepareParts.map((part, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex-grow">
                    <input
                      type="text"
                      name={`preparePart${index + 1}`}
                      value={part}
                      onChange={(e) => handlePreparePartChange(e, index)}
                      className="text-gray-900 w-full border-gray-300 rounded-md px-3 py-2 mt-5 resize-none border h-10"
                      placeholder={`${t('edit_courses.prepare_part')} ${index + 1} ${t('edit_courses.cant_be_blank')}`}
                    />
                  </div>
                  <button className="ml-3 btn bg-red-500 hover:bg-red-400 p-2 rounded-sm mt-4">
                    <svg
                      className="h-4 w-4 fill-current text-white cursor-pointer"
                      viewBox="0 0 16 16"
                      onClick={() => {
                        removeInputprepareParts(index)
                      }}
                    >
                      <path d="M5 7h2v6H5V7zm4 0h2v6H9V7zm3-6v2h4v2h-1v10c0 .6-.4 1-1 1H2c-.6 0-1-.4-1-1V5H0V3h4V1c0-.6.4-1 1-1h6c.6 0 1 .4 1 1zM6 2v1h4V2H6zm7 3H3v9h10V5z" />
                    </svg>
                  </button>
                </div>
              ))}
              {/* Add Prepare Part Button */}
              <button
                type="button"
                onClick={() => {
                  setPrepareParts([...prepareParts, '']) // Thêm dòng input mới
                }}
                className="btn bg-green-500 hover:bg-green-400 p-1.5 rounded-sm mt-6 ml-2"
              >
                <svg className="w-4 h-4 fill-current text-white shrink-0" viewBox="0 0 16 16">
                  <path d="M15 7H9V1c0-.6-.4-1-1-1S7 .4 7 1v6H1c-.6 0-1 .4-1 1s.4 1 1 1h6v6c0 .6.4 1 1 1s1-.4 1-1V9h6c.6 0 1-.4 1-1s-.4-1-1-1z" />
                </svg>
              </button>
            </div>
            <div className="lg:flex md:flex">
              <div className="md:w-1/2 ml-5 mr-5 mt-5">
                <label
                  htmlFor="locationPath"
                  className="block mb-5 text-sm font-medium ml-2"
                >
                  {t('edit_courses.upload_image')}:
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
                      className={hasError ? 'border border-red-500' : ''}
                    />
                  )}
                />
                <PreviewFiles
                  fileList={watch('locationPath')}
                  onRemoveFile={handleRemoveFile}
                  className="mt-3"
                />

                {!(newImage ?? watch('locationPath')?.length > 0) && (
                  <img
                    className="object-contain max-w-full max-h-full rounded-t-md transition-transform duration-700 hover:scale-110"
                    src={
                      courseData.locationPath
                        ? `${process.env.REACT_APP_API}/uploads/courses/${courseData.locationPath}`
                        : 'https://picsum.photos/200/300'
                    }
                    style={{ width: '250px', height: '150px' }}
                    alt="CourseImage"
                  />
                )}
              </div>
              <div className="md:w-1/2 block ml-5 mr-5 mt-5">
                {/* <div className="flex items-center">
                  <label className="block text-sm font-medium mb-5">{t('edit_courses.notify_users')}:</label>
                  <input
                    type="checkbox"
                    className="mb-5 ml-3"
                  />
                </div> */}
                <div className="flex items-center">
                  <label className="block text-sm font-medium mr-2 mb-5">{t('edit_courses.status')}:</label>
                  <input
                    type="checkbox"
                    checked={statusChecked}
                    onChange={handleStatusChange}
                    className="ml-3 mb-5"
                  />
                </div>
                {statusChecked && (
                  <div className="flex flex-col">
                    {/* Move Public now section to the top */}
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="public"
                        name="publicStatus"
                        checked={!publicChecked && statusChecked}
                        onChange={handleHiddenRadioChange}
                        className="mr-2"
                      />
                      <label htmlFor="publicStatus" className="ml-2 text-sm font-medium">
                        {t('edit_courses.public_now')}:
                      </label>
                    </div>
                    {/* Move Public appointments section below */}
                    <div className="flex items-center mb-2">
                      <input
                        type="radio"
                        id="publicAppointments"
                        name="publicStatus"
                        checked={publicChecked}
                        onChange={handlePublicRadioChange}
                        className="mr-2"
                      />
                    <div className="flex items-center gap-3">
                        <label
                          htmlFor="publicDate"
                          className="ml-2 text-sm font-medium whitespace-nowrap"
                        >
                          {t('edit_courses.public_appointment')}:
                        </label>
                     <div className="relative w-48">
                        <DatePicker
                          key={`public-${i18n.language}`}
                          selected={
                            tempPublicDate
                              ? new Date(tempPublicDate)
                              : courseData?.publicDate
                                ? new Date(courseData.publicDate)
                                : null
                          }
                          onChange={(date: Date | null) => handleDatePickerChange(date, 'publicDate')}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat={dateTimeFormat}
                          locale={locale}
                          timeCaption={(t('picker.time_caption') ?? '')}
                          placeholderText={t('picker.placeholder_public_date') ?? ''}
                          className={`border rounded-md px-3 py-2 w-full h-10 ${isSaveClicked && invalidFields.includes('publicDate') ? 'border-red-500' : ''
                            }`}
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
                  </div>
                )}
              </div>
            </div>
          </tbody>
          <div className="flex justify-end mb-5">
            <button className="bg-gray-300 text-black px-4 py-2 rounded-full mr-2 hover:bg-gray-400 hover:text-black border border-gray-300 min-w-[100px]" onClick={handleCancel}>{t('edit_courses.cancel')}</button>
            <button
              onClick={handleUpdateCourse}
              className="bg-teal-400 text-white font-bold py-2 px-4 hover:bg-teal-500 rounded-full border border-teal-500 mr-4"
            >
              {t('edit_courses.save')}

            </button>
          </div>
        </table>
      )}
    </div>
  )
}

export default EditCourse
