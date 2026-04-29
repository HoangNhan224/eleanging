/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: AdvancedSettings.tsx
========================================================================== */
import React, { useEffect, useRef, useState } from 'react'
import Select from 'react-select'
import { toast } from 'react-toastify'
import { getExamById, updateExam } from '../../../../api/post/post.api'
import { useTranslation } from 'react-i18next'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useDatePickerLocale } from '../../../../hooks/useDatePickerLocale'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'

interface AdvancedSettingsProps {
  examId?: number
}

interface ValidationState {
  isValidDuration: boolean
  isValidPoint: boolean
  isValidAttempts: boolean
  isValidPublicDate: boolean
  isValidAnswerVisible: boolean
}

const defaultValidation: ValidationState = {
  isValidDuration: true,
  isValidPoint: true,
  isValidAttempts: true,
  isValidPublicDate: true,
  isValidAnswerVisible: true
}

const customStyles = (isError: boolean) => ({
  control: (provided: any, state: any) => ({
    ...provided,
    borderColor: isError ? 'red' : state.isFocused ? 'teal' : provided.borderColor,
    boxShadow: isError ? '0 0 0 1px red' : state.isFocused ? '0 0 0 1px teal' : provided.boxShadow,
    '&:hover': {
      borderColor: isError ? 'red' : state.isFocused ? 'teal' : provided['&:hover']?.borderColor
    }
  })
})

interface PublishOption {
  value: string
  label: string
}

const publishOptions: PublishOption[] = [
  { value: '0', label: 'Không công khai' },
  { value: '1', label: 'Công khai' }
]

interface AnswerVisibleOption {
  value: string
  label: string
}

const answerVisibleOptions: AnswerVisibleOption[] = [
  { value: '0', label: 'Hide answers' },
  { value: '1', label: 'Show answers' }
]

/**
 * AdvancedSettings component for managing advanced settings of an exam.
 *
 * @author Hien
 * @component
 * @param {object} props - The properties passed to the component.
 * @returns {JSX.Element} The rendered AdvancedSettings component.
 */
const AdvancedSettings: React.FC<AdvancedSettingsProps> = ({ examId }) => {
  const { t } = useTranslation()
  const { locale, dateTimeFormat } = useDatePickerLocale()
  // TODO: Initialize state for duration in minutes
  const [durationInMinute, setDurationInMinute] = useState('')
  // TODO: Initialize state for points required to pass the exam
  const [pointToPass, setPointToPass] = useState('')
  // TODO: Initialize state for the number of attempts allowed
  const [numberOfAttemps, setNumberOfAttemps] = useState('')
  // TODO: Initialize state for the public date of the exam
  const [publicDate, setPublicDate] = useState<Date | null>(null)
  // TODO: Initialize state for input validation
  const [validation, setValidation] = useState<ValidationState>(defaultValidation)
  // TODO: Initialize state for the publish status of the exam
  const [publishStatus, setPublishStatus] = useState<PublishOption>(publishOptions[0])
  // TODO: Initialize state for answer visibility after exam completion
  const [answerVisible, setAnswerVisible] = useState<AnswerVisibleOption>(answerVisibleOptions[0])

  // TODO: Initialize useRef for duration input
  const durationRef = useRef<HTMLInputElement>(null)
  // TODO: Initialize useRef for point input
  const pointRef = useRef<HTMLInputElement>(null)
  // TODO: Initialize useRef for attempts input
  const attempRef = useRef<HTMLInputElement>(null)
  // TODO: Initialize useRef for public date input
  const publicDateRef = useRef<HTMLInputElement>(null)

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
        if (examId) {
          const response = await getExamById(examId)
          if (response.status === 200) {
            const exam = response.data
            setDurationInMinute(exam.durationInMinute ? exam.durationInMinute.toString() : '')
            setPointToPass(exam.pointToPass ? exam.pointToPass.toString() : '')
            setNumberOfAttemps(exam.numberOfAttempt ? exam.numberOfAttempt.toString() : '')

            // TODO: Set answer visibility status
            if (exam.answerVisible === true || exam.answerVisible === 1) {
              setAnswerVisible({ value: '1', label: 'Hiển thị đáp án' })
            } else {
              setAnswerVisible({ value: '0', label: 'Ẩn đáp án' })
            }

            // TODO: Check if the exam is public
            if (exam.publicStatus?.toString() === '1') {
              setPublishStatus({ value: '1', label: 'Công khai' })
              setPublicDate(exam.publicDate ? new Date(exam.publicDate) : null)
            } else {
              setPublishStatus({ value: '0', label: 'Không công khai' })
              setPublicDate(null)
            }
          }
        }
      } catch (error) {
        // console.error(error)
      }
    }
    fetchExamDetails()
  }, [examId])

  /**
   * Validates the input fields.
   *
   * @author Hien
   * @returns {boolean} True if all inputs are valid, false otherwise.
   */
  const isValidInputs = (): boolean => {
    setValidation(defaultValidation)

    if (durationInMinute === '' || durationInMinute === null) {
      toast.error(t('exam_admin.advanced_settings.toast.duration_required'))
      setValidation({ ...defaultValidation, isValidDuration: false })
      durationRef.current?.focus()
      return false
    }
    // TODO: Check if point to pass is empty
    if (pointToPass === '' || pointToPass === null) {
      toast.error(t('exam_admin.advanced_settings.toast.point_required'))
      setValidation({ ...defaultValidation, isValidPoint: false })
      pointRef.current?.focus()
      return false
    }
    // TODO: Check if point to pass is within valid range (0-100)
    const pointValue = Number(pointToPass)
    if (pointValue < 0 || pointValue > 100) {
      toast.error(t('exam_admin.advanced_settings.toast.point_range_invalid'))
      setValidation({ ...defaultValidation, isValidPoint: false })
      pointRef.current?.focus()
      return false
    }
    // TODO: Check if number of attempts is empty
    if (numberOfAttemps === '' || numberOfAttemps === null) {
      toast.error(t('exam_admin.advanced_settings.toast.attempts_required'))
      setValidation({ ...defaultValidation, isValidAttempts: false })
      attempRef.current?.focus()
      return false
    }
    // TODO: Check if public date is empty when publish status is public
    if (publishStatus.value === '1' && !publicDate) {
      toast.error(t('exam_admin.advanced_settings.toast.public_date_required'))
      setValidation({ ...defaultValidation, isValidPublicDate: false })
      return false
    }
    // if (answerVisible.value === '') {
    //   toast.error(t('exam_admin.advanced_settings.toast.answer_visible_required'))
    //   setValidation({ ...defaultValidation, isValidAnswerVisible: false })
    //   return false
    // }
    return true
  }

  /**
   * Handles the submission of the form.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleSubmit = async () => {
    // TODO: Check if inputs are valid
    if (isValidInputs()) {
      const payload = {
        durationInMinute: Number(durationInMinute),
        pointToPass: Number(pointToPass),
        numberOfAttempt: Number(numberOfAttemps),
        publicStatus: Number(publishStatus.value),
        publicDate: publishStatus.value === '1' && publicDate ? publicDate.toISOString() : null,
        answerVisible: answerVisible.value === '1'
      }
      try {
        const response = await updateExam(examId!, payload)
        if (response.status === 200) {
          toast.success(t('exam_admin.advanced_settings.toast.update_success'))
          if (publishStatus.value === '0') {
            setPublicDate(null)
          }
        } else {
          toast.error(t('exam_admin.advanced_settings.toast.update_failed'))
        }
      } catch (error) {
        // console.error(error)
      }
    }
  }

  return (
    <div className="p-6 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 mb-5">
      {t('exam_admin.advanced_settings.title')}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Time to do the test */}
        <div>
          <label
            className="block font-bold mb-2"
            htmlFor="durationInMinute"
          >
            {t('exam_admin.advanced_settings.duration_label')}
          </label>
          <input
            ref={durationRef}
            className={
              validation.isValidDuration
                ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400'
                : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'
            }
            id="durationInMinute"
            type="number"
            placeholder={t('exam_admin.advanced_settings.placeholder_duration') ?? ''}
            value={durationInMinute}
            onChange={(e) => {
              setDurationInMinute(e.target.value)
              setValidation({ ...validation, isValidDuration: true })
            }}
          />
        </div>

        {/* Points to get */}
        <div>
          <label
            className="block font-bold mb-2"
            htmlFor="pointToPass"
          >
            {t('exam_admin.advanced_settings.point_to_pass_label')} {t('exam_admin.advanced_settings.point_to_pass_description')}
          </label>
          <input
            ref={pointRef}
            className={
              validation.isValidPoint
                ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400'
                : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'
            }
            id="pointToPass"
            type="number"
            placeholder={t('exam_admin.advanced_settings.placeholder_point') ?? ''}
            value={pointToPass}
            onChange={(e) => {
              setPointToPass(e.target.value)
              setValidation({ ...validation, isValidPoint: true })
            }}
          />
        </div>

        {/* Number of executions */}
        <div>
          <label
            className="block font-bold mb-2"
            htmlFor="numberOfAttemps"
          >
            {t('exam_admin.advanced_settings.attempts_label')}
          </label>
          <input
            ref={attempRef}
            className={
              validation.isValidAttempts
                ? 'form-input w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400'
                : 'form-input w-full border p-2 rounded-md focus:outline-none border-red-500'
            }
            id="numberOfAttemps"
            type="number"
            placeholder={t('exam_admin.advanced_settings.placeholder_attempts') ?? ''}
            value={numberOfAttemps}
            onChange={(e) => {
              setNumberOfAttemps(e.target.value)
              setValidation({ ...validation, isValidAttempts: true })
            }}
          />
        </div>

        {/* Answer visibility after exam completion */}
        <div>
          <label
            className="block font-bold mb-2"
            htmlFor="answerVisible"
          >
            {t('exam_admin.advanced_settings.answer_visible_label')}
          </label>
          <Select
            inputId="answerVisible"
            options={answerVisibleOptions}
            value={answerVisible}
            onChange={(option) => option && setAnswerVisible(option)}
            styles={customStyles(false)}
            className="z-2"
            formatOptionLabel={(option: AnswerVisibleOption) =>
              t(`exam_admin.advanced_settings.${option.value === '1' ? 'show_answer' : 'hide_answer'}`) || option.label
            }
          />
        </div>

        {/* Public state using react-select */}
        <div>
          <label
            className="block font-bold mb-2"
            htmlFor="publishStatus"
          >
            {t('exam_admin.advanced_settings.public_status_label')}
          </label>
          <Select
            inputId="publishStatus"
            options={publishOptions}
            value={publishStatus}
            onChange={(option) => option && setPublishStatus(option)}
            styles={customStyles(false)}
            className="z-2"
            formatOptionLabel={(option: PublishOption) => t(`exam_admin.advanced_settings.${option.value === '1' ? 'public' : 'not_public'}`)}
          />
        </div>

        {/* Unlock date and time are only displayed when status is "Public" */}
        {publishStatus.value === '1' && (
          <div>
            <label
              className="block font-bold mb-2"
              htmlFor="publicDate"
            >
              {t('exam_admin.advanced_settings.public_date_label')}
            </label>
            <div className="relative w-48">
              <DatePicker
                selected={publicDate}
                onChange={(date) => {
                  setPublicDate(date)
                  setValidation({ ...validation, isValidPublicDate: true })
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat={dateTimeFormat}
                locale={locale}
                timeCaption={(t('picker.time_caption') ?? '')}
                placeholderText={t('picker.placeholder_public_date') ?? ''}
                className={
                  validation.isValidPublicDate
                    ? 'form-input w-full border border-gray-300 p-2 pr-10 rounded-md focus:outline-none focus:ring-1 focus:ring-teal-400'
                    : 'form-input w-full border p-2 pr-10 rounded-md focus:outline-none border-red-500'
                }
                wrapperClassName="w-full"
                popperClassName="!w-96 !max-w-none"
                popperPlacement="bottom-start"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <CalendarMonthIcon className="text-gray-400 w-5 h-5" />
              </div>
            </div>
          </div>
        )}
      </div>
      <div className='flex justify-end w-full mt-4'>
      <button
        className="bg-teal-400 text-white px-4 py-2 rounded-md hover:bg-teal-500 hover:text-white"
        type="button"
        onClick={handleSubmit}
      >
        {t('exam_admin.advanced_settings.save_changes')}
      </button>
      </div>
    </div>
  )
}

export default AdvancedSettings
