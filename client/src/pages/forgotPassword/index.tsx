/* eslint-disable multiline-ternary */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* PAGE: UserPage
========================================================================== */
import React, { useCallback, useState, useEffect, useMemo } from 'react'
import { toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { sendOTP, verifyOTP, resetPassword } from '../../api/post/post.api'
import Countdown from 'react-countdown'
import Select from 'react-select'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import ROUTES from 'routes/constant'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import CircularProgress from '@mui/material/CircularProgress'
import OTPInput from 'react-otp-input'

interface FormInputs {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

/**
 * ResetPasswordPage component handles the password reset process.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered ResetPasswordPage component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {object} i18n - The i18n instance for language management.
 * @property {string} otp - The state for storing the OTP.
 * @property {number} step - The state for managing the current step in the process.
 * @property {boolean} isLoading - The state for managing the loading state.
 * @property {boolean} isLoadingResend - The state for managing the resend loading state.
 * @property {Date | null} expiryTime - The state for storing the OTP expiry time.
 * @property {boolean} canShowResend - The state for managing the resend button visibility.
 * @property {boolean} passwordVisible - The state for managing the password visibility.
 * @property {boolean} confirmPasswordVisible - The state for managing the confirm password visibility.
 * @property {string} selectedLanguage - The state for storing the selected language.
 */
const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [otp, setOTP] = useState<string>('')
  const [step, setStep] = useState<number>(1) // Step 1: Nhập email, Step 2: Nhập OTP, Step 3: Nhập mật khẩu mới
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLoadingResend, setIsLoadingResend] = useState<boolean>(false)
  const [expiryTime, setExpiryTime] = useState<Date | null>(null) // Thời gian hết hạn
  const [canShowResend, setCanShowResend] = useState(false)
  const [passwordVisible, setPasswordVisible] = useState(false)
  const togglePasswordVisibility = () => setPasswordVisible(!passwordVisible)
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false)
  const toggleConfirmPasswordVisibility = () => setConfirmPasswordVisible(!confirmPasswordVisible)
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })

  // Validation schema for step 1
  const step1Schema = yup.object({
    email: yup
      .string()
      .email(String(t('forgot_password.errors.email_is_invalid')))
      .required(String(t('forgot_password.errors.email_is_required')))
  })

  // Validation schema for step 2
  const step2Schema = yup.object({
    otp: yup
      .string()
      .length(6, String(t('forgot_password.errors.otp_length')))
      .required(String(t('forgot_password.errors.otp_required')))
  })

  // Validation schema for step 3
  const step3Schema = yup.object({
    newPassword: yup
      .string()
      .min(8, String(t('forgot_password.errors.new_password_min_length')))
      .required(String(t('forgot_password.errors.new_password_required'))),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('newPassword'), null], String(t('forgot_password.errors.confirm_password_must_match')))
      .required(String(t('forgot_password.errors.confirm_password_required')))
  })

  // const step3Schema = yup.object({
  //   newPassword: yup
  //     .string()
  //     .min(8, String(t('forgot_password.errors.new_password_min_length')))
  //     .required(String(t('forgot_password.errors.new_password_required'))),
  //   confirmPassword: yup
  //     .string()
  //     .when('newPassword', {
  //       is: (val: string) => val && val.length > 0,
  //       then: yup
  //         .string()
  //         .oneOf([yup.ref('newPassword')], String(t('forgot_password.errors.confirm_password_must_match')))
  //         .required(String(t('forgot_password.errors.confirm_password_required'))),
  //       otherwise: yup.string().required(String(t('forgot_password.errors.confirm_password_required')))
  //     })
  // })

  // Form methods for step 1
  const step1Methods = useForm<FormInputs>({
    resolver: yupResolver(step1Schema)
    // mode: 'onChange'
  })

  // Form methods for step 2
  const step2Methods = useForm<FormInputs>({
    resolver: yupResolver(step2Schema),
    defaultValues: { otp: '' }
  })

  // Form methods for step 3
  const step3Methods = useForm<FormInputs>({
    resolver: yupResolver(step3Schema)
  })

  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 }, getValues } = step1Methods
  const { handleSubmit: handleSubmitStep2, setValue: setOTPValue, formState: { errors: errorsStep2 }, clearErrors: clearErrorsStep2 } = step2Methods
  const { register: registerStep3, handleSubmit: handleSubmitStep3, formState: { errors: errorsStep3 } } = step3Methods

  //  Handles navigation back to the login page.
  const handleBackToLogin = () => {
    navigate(ROUTES.login)
    step1Methods.reset()
    step2Methods.reset()
    step3Methods.reset()
    setOTP('')
    setExpiryTime(null)
    setIsLoading(false)
  }

  /**
   * Handles sending the OTP to the user's email.
   *
   * @author Hien
   * @async
   * @param {FormInputs} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleSendOTP = async (data: FormInputs) => {
    setIsLoading(true)
    try {
      const otpDetails = {
        email: data.email,
        language: selectedLanguage
      }
      const response = await sendOTP(otpDetails)
      if (response.status === 200) {
        // toast.success(t('forgot_password.toast.otp_sent_successfully'))
        setStep(2) // Chuyển sang bước nhập OTP
        setExpiryTime(new Date(Date.now() + 60 * 1000))
      }
    } catch (error: { code: number, message: string } | any) {
      if (error.code === 404) {
        toast.error(t('forgot_password.toast.user_not_found'))
      } else if (error.code === 403) {
        toast.error(t('forgot_password.toast.otp_can_only_be_sent_to_local_account'))
      } else {
        toast.error(t('forgot_password.toast.error_sending_otp'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles verifying the OTP entered by the user.
   *
   * @author Hien
   * @async
   * @param {FormInputs} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleVerifyOTP = async (data: FormInputs) => {
    setIsLoading(true)
    try {
      const response = await verifyOTP({ email: step1Methods.getValues('email'), otp: data.otp })
      if (response.status === 200) {
        // toast.success(t('forgot_password.toast.otp_verified_successfully'))
        setStep(3) // Chuyển sang bước nhập mật khẩu mới
      }
    } catch (error: { code: number, message: string } | any) {
      if (error.code === 400) {
        toast.error(t('forgot_password.toast.otp_is_invalid'))
      } else if (error.code === 404) {
        toast.error(t('forgot_password.toast.user_not_found'))
      } else if (error.code === 403) {
        toast.error(t('forgot_password.toast.otp_has_expired'))
      } else {
        toast.error(t('forgot_password.toast.error_verifying_otp'))
      }
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles resetting the user's password.
   *
   * @author Hien
   * @async
   * @param {FormInputs} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleResetPassword = async (data: FormInputs) => {
    setIsLoading(true)
    try {
      const response = await resetPassword({
        email: step1Methods.getValues('email'),
        otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword
      })
      if (response.status === 200) {
        toast.success(t('forgot_password.toast.password_reset_successfully'))
        navigate(ROUTES.login)
      } else {
        toast.error(t('forgot_password.toast.error_resetting_password'))
      }
    } catch (error: any) {
      toast.error(t('forgot_password.toast.error_resetting_password'))
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handles resending the OTP to the user's email.
   *
   * @author Hien
   * @async
   * @returns {Promise<void>}
   */
  const handleResendOTP = async () => {
    const currentTime = new Date()

    if (expiryTime && currentTime < expiryTime) {
      toast.info(t('forgot_password.toast.wait_for_resend_otp'))
      return
    }

    setIsLoadingResend(true)
    try {
      const emailValue = getValues('email')
      const otpDetails = {
        email: emailValue,
        language: selectedLanguage
      }
      const response = await sendOTP(otpDetails) // Gửi lại OTP
      if (response.status === 200) {
        // toast.success(t('forgot_password.toast.otp_sent_successfully'))
        setExpiryTime(new Date(Date.now() + 60 * 1000))
        setCanShowResend(false)
        setOTP('')
      }
    } catch (error: { code: number, message: string } | any) {
      if (error.code === 404) {
        toast.error(t('forgot_password.toast.user_not_found'))
      } else if (error.code === 403) {
        toast.error(t('forgot_password.toast.otp_can_only_be_sent_to_local_account'))
      } else {
        toast.error(t('forgot_password.toast.error_sending_otp'))
      }
    } finally {
      setIsLoadingResend(false)
    }
  }

  // // Bộ đếm ngược hoàn thành
  // const handleCountdownComplete = () => {
  //   toast.error(t('forgot_password.toast.otp_expired'))
  //   setStep(1) // Quay lại bước nhập email nếu hết thời gian

  //   // Reset toàn bộ các form của từng bước
  //   step1Methods.reset() // Reset form bước 1
  //   step2Methods.reset() // Reset form bước 2
  //   step3Methods.reset() // Reset form bước 3

  //   // Đặt lại các state khác
  //   setOTP('') // Đặt lại giá trị OTP
  //   setExpiryTime(null) // Đặt lại thời gian hết hạn
  //   setIsLoading(false) // Dừng loading nếu có
  // }

  // Change language
  // eslint-disable-next-line @typescript-eslint/no-unused-vars

  // Change language on selectedLanguage change
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])

  // Language options for the select component
  const languageOptions = useMemo(() => [
    { label: 'En', value: 'en', flagUrl: '/assets/images/login/Flag_of_the_United_Kingdom.png' },
    { label: 'Vi', value: 'vi', flagUrl: '/assets/images/login/Flag_of_Vietnam.png' }
  ], [])

  // Format option label for the select component
  const formatOptionLabel = ({ label, flagUrl }: any) => (
    <div className="flex items-center">
      <img src={flagUrl} alt="" className="w-6 h-4 mr-2" />
      {label}
    </div>
  )

  // Format option label for the select component (duplicate function)
  const formatOptionLabel2 = ({ label, flagUrl }: any) => (
    <div className="flex items-center">
      <img src={flagUrl} alt="" className="w-6 h-4 mr-2" />
      {label}
    </div>
  )

  /**
   * Handles changing the language.
   *
   * @author Hien
   * @async
   * @param {object} selectedOption - The selected language option.
   * @returns {Promise<void>}
   */
  const handleChange = useCallback(
    async (selectedOption) => {
      const newLanguage = selectedOption.value
      try {
        await i18n.changeLanguage(newLanguage)
        setSelectedLanguage(newLanguage)
        localStorage.setItem('selectedLanguage', newLanguage)

        // Check if there are errors in the current form before calling revalidation
        if (step === 1 && Object.keys(step1Methods.formState.errors).length > 0) {
          await step1Methods.trigger()
        } else if (step === 2 && Object.keys(step2Methods.formState.errors).length > 0) {
          await step2Methods.trigger()
        } else if (step === 3 && Object.keys(step3Methods.formState.errors).length > 0) {
          await step3Methods.trigger()
        } else {
          // console.log('No errors, no revalidation needed.')
        }
      } catch (error) {
        console.log('Error during language change or validation', error)
      }
    },
    [i18n, step1Methods, step2Methods, step3Methods, step]
  )

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="flex w-full h-full shadow-lg overflow-hidden relative">
        {/* Left Side Image (Chỉ hiển thị trên màn hình lớn hơn) */}
        <div className="hidden md:block w-1/2">
          <img
            src='/assets/images/login/login.png'
            alt="Login Image"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="flex items-center justify-center w-full md:w-1/2 p-2 bg-white relative md:bg-white md:p-2">
          {/* Background Image for Mobile */}
          <div className="absolute inset-0 md:hidden">
            <img
              src='/assets/images/login/login.png'
              alt="Login Image"
              className="h-full w-full object-cover"
            />
          </div>
          {/* Language Selector */}
          <div className="absolute top-4 right-4 z-10 hidden md:block">
            <Select
              value={languageOptions.find(option => option.value === selectedLanguage)}
              onChange={handleChange}
              options={languageOptions}
              formatOptionLabel={formatOptionLabel}
              className="w-30 rounded-md font-semibold text-gray-700 border border-gray-300 focus:border-teal-400 focus:outline-none shadow-sm"
              isSearchable={false} // Tắt tính năng tìm kiếm
            />
          </div>
          {/* Form */}
          <div className="relative w-full max-w-xl bg-white bg-opacity-90 p-4 rounded-lg md:bg-white">
            {/* Language Selector for Mobile */}
            {step === 1 ? (
              // Step 1: Enter Email
              <>
                {/* Language Selector for Mobile */}
                <div className="absolute top-0 right-0 md:hidden">
                  <Select
                    value={languageOptions.find(option => option.value === selectedLanguage)}
                    onChange={handleChange}
                    options={languageOptions}
                    formatOptionLabel={formatOptionLabel2}
                    className="rounded-md font-semibold text-gray-700 border border-gray-300 focus:border-teal-400 focus:outline-none shadow-sm"
                    isSearchable={false} // Tắt tính năng tìm kiếm
                  />
                </div>
                <div className='flex justify-center mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-14 border border-zinc-400 rounded-lg bg-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center mb-1">{t('forgot_password.forgot_password??')}</h2>
                <p className="text-center mb-16">{t('forgot_password.we_will_send_you_reset_instructions')}</p>
                {/* Step 1: Enter Email */}
                <form onSubmit={handleSubmitStep1(handleSendOTP)}>
                  <div className="mb-4 relative">
                    {/* <label htmlFor="email" className="block text-gray-700">Email Address</label> */}
                    <input
                      {...registerStep1('email')}
                      type="text"
                      id="email"
                      className={`peer w-full border border-teal-500 rounded-lg pl-9 py-2 md:py-3 lg:py-3 outline-none focus:border-teal-500 ${errorsStep1.email ? 'border-red-500' : ''}`}
                      placeholder=""
                    />
                    <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="16" viewBox="0 0 20 16" fill="none">
                        <path d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z" fill="#8C8C8C" />
                      </svg>
                    </span>
                    <label
                      htmlFor="email"
                      className="absolute left-9 text-base md:text-lg lg:text-2xl text-teal-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-teal-500 peer-focus:lg:text-2xl"
                    >
                      {t('forgot_password.email_account')}
                    </label>
                    <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                      {errorsStep1.email && (
                        <p className="text-red-500 text-xs">
                          {t(errorsStep1.email.message ?? 'default_error_message')}
                        </p>
                      )}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 md:py-3 lg:py-3 px-4 mb-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={16} /> : t('forgot_password.send_otp')}
                  </button>
                </form>
                <div className="flex justify-center">
                  <button onClick={handleBackToLogin} className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5.25 11.25H20.25C20.4489 11.25 20.6397 11.329 20.7803 11.4697C20.921 11.6103 21 11.8011 21 12C21 12.1989 20.921 12.3897 20.7803 12.5303C20.6397 12.671 20.4489 12.75 20.25 12.75H5.25C5.05109 12.75 4.86032 12.671 4.71967 12.5303C4.57902 12.3897 4.5 12.1989 4.5 12C4.5 11.8011 4.57902 11.6103 4.71967 11.4697C4.86032 11.329 5.05109 11.25 5.25 11.25Z" fill="black" />
                      <path d="M5.56038 12L11.7809 18.219C11.9217 18.3598 12.0008 18.5508 12.0008 18.75C12.0008 18.9491 11.9217 19.1401 11.7809 19.281C11.64 19.4218 11.449 19.5009 11.2499 19.5009C11.0507 19.5009 10.8597 19.4218 10.7189 19.281L3.96888 12.531C3.89903 12.4613 3.84362 12.3785 3.80581 12.2874C3.768 12.1963 3.74854 12.0986 3.74854 12C3.74854 11.9013 3.768 11.8036 3.80581 11.7125C3.84362 11.6214 3.89903 11.5386 3.96888 11.469L10.7189 4.71897C10.8597 4.57814 11.0507 4.49902 11.2499 4.49902C11.449 4.49902 11.64 4.57814 11.7809 4.71897C11.9217 4.8598 12.0008 5.05081 12.0008 5.24997C12.0008 5.44913 11.9217 5.64014 11.7809 5.78097L5.56038 12Z" fill="black" />
                    </svg>
                    <span>{t('forgot_password.back_to_login')}</span>
                  </button>
                </div>
              </>
            ) : step === 2 ? (
              // Step 2: Verify OTP
              <>
                {/* Language Selector for Mobile */}
                <div className="absolute top-0 right-0 md:hidden">
                  <Select
                    value={languageOptions.find(option => option.value === selectedLanguage)}
                    onChange={handleChange}
                    options={languageOptions}
                    formatOptionLabel={formatOptionLabel2}
                    className="rounded-md font-semibold text-gray-700 border border-gray-300 focus:border-teal-400 focus:outline-none shadow-sm"
                    isSearchable={false} // Tắt tính năng tìm kiếm
                  />
                </div>
                <form onSubmit={handleSubmitStep2(handleVerifyOTP)}>
                  <div className="flex flex-col items-center mb-6">
                    <div className="bg-teal-500 p-4 rounded-full">
                      <svg
                        className="animate-bounce w-12 h-12"
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        style={{ fill: 'rgba(255, 255, 255, 1)', transform: '', msFilter: '' }}
                      >
                        <path d="M20 4H4c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm0 2v.511l-8 6.223-8-6.222V6h16zM4 18V9.044l7.386 5.745a.994.994 0 0 0 1.228 0L20 9.044 20.002 18H4z"></path>
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold mt-4">{t('forgot_password.verify_your_email_address')}</h2>
                  </div>
                  <p className="text-gray-600 mb-4">
                    {t('forgot_password.verification_code_has_been_sent_to')} <strong className="text-black">{step1Methods.getValues('email')}</strong>
                  </p>
                  <p className="text-gray-500 mb-8">
                    {t('forgot_password.please_check_your_inbox_and_enter_the_verification_code_below_to_verify_your_email_address')}
                    {expiryTime ? (
                      <Countdown
                        key={expiryTime.getTime()}
                        date={expiryTime.getTime()}
                        onComplete={() => setCanShowResend(true)}
                        renderer={({ minutes, seconds }) => (
                          <span className="text-red-500">
                            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                          </span>
                        )}
                      />
                    ) : (
                      <span className="text-red-500">01:00</span>
                    )}
                  </p>
                  <div className="flex justify-center mb-8">
                    <OTPInput
                      value={otp}
                      onChange={(value) => {
                        setOTP(value)
                        setOTPValue('otp', value)
                        if (value.length === 6) clearErrorsStep2('otp')
                      }}
                      numInputs={6}
                      renderInput={(inputProps, index) => (
                        <input
                          {...inputProps}
                          className="w-10 h-10 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 xl:w-16 xl:h-16 text-center border border-teal-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                        />
                      )}
                      renderSeparator={<span className="mx-2">-</span>}
                      shouldAutoFocus
                      skipDefaultStyles
                      inputType='tel'
                    />
                  </div>
                  <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                    {errorsStep2.otp && <p className="text-red-500 text-xs">{errorsStep2.otp.message}</p>}
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 md:py-3 lg:py-3 px-4 mb-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={16} /> : t('forgot_password.verify_otp')}
                  </button>
                </form>
                {canShowResend && (
                <div className="flex justify-center mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="">{t('forgot_password.did_not_receive_email')}</span>
                      <button
                        onClick={handleResendOTP}
                        className="text-teal-500 hover:underline"
                        disabled={isLoadingResend}
                      >
                        {isLoadingResend ? t('forgot_password.resending_otp') : t('forgot_password.resend_otp')}
                      </button>
                  </div>
                </div>
                )}
                <div className="flex justify-center">
                  <button onClick={handleBackToLogin} className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5.25 11.25H20.25C20.4489 11.25 20.6397 11.329 20.7803 11.4697C20.921 11.6103 21 11.8011 21 12C21 12.1989 20.921 12.3897 20.7803 12.5303C20.6397 12.671 20.4489 12.75 20.25 12.75H5.25C5.05109 12.75 4.86032 12.671 4.71967 12.5303C4.57902 12.3897 4.5 12.1989 4.5 12C4.5 11.8011 4.57902 11.6103 4.71967 11.4697C4.86032 11.329 5.05109 11.25 5.25 11.25Z" fill="black" />
                      <path d="M5.56038 12L11.7809 18.219C11.9217 18.3598 12.0008 18.5508 12.0008 18.75C12.0008 18.9491 11.9217 19.1401 11.7809 19.281C11.64 19.4218 11.449 19.5009 11.2499 19.5009C11.0507 19.5009 10.8597 19.4218 10.7189 19.281L3.96888 12.531C3.89903 12.4613 3.84362 12.3785 3.80581 12.2874C3.768 12.1963 3.74854 12.0986 3.74854 12C3.74854 11.9013 3.768 11.8036 3.80581 11.7125C3.84362 11.6214 3.89903 11.5386 3.96888 11.469L10.7189 4.71897C10.8597 4.57814 11.0507 4.49902 11.2499 4.49902C11.449 4.49902 11.64 4.57814 11.7809 4.71897C11.9217 4.8598 12.0008 5.05081 12.0008 5.24997C12.0008 5.44913 11.9217 5.64014 11.7809 5.78097L5.56038 12Z" fill="black" />
                    </svg>
                    <span>{t('forgot_password.back_to_login')}</span>
                  </button>
                </div>
              </>
            ) : (
              // Step 3: Reset Password
              <>
                {/* Language Selector for Mobile */}
                <div className="absolute top-0 right-0 md:hidden">
                  <Select
                    value={languageOptions.find(option => option.value === selectedLanguage)}
                    onChange={handleChange}
                    options={languageOptions}
                    formatOptionLabel={formatOptionLabel2}
                    className="rounded-md font-semibold text-gray-700 border border-gray-300 focus:border-teal-400 focus:outline-none shadow-sm"
                    isSearchable={false}
                  />
                </div>
                <div className='flex justify-center mb-4'>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-14 border border-zinc-400 rounded-lg bg-white">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7.864 4.243A7.5 7.5 0 0 1 19.5 10.5c0 2.92-.556 5.709-1.568 8.268M5.742 6.364A7.465 7.465 0 0 0 4.5 10.5a7.464 7.464 0 0 1-1.15 3.993m1.989 3.559A11.209 11.209 0 0 0 8.25 10.5a3.75 3.75 0 1 1 7.5 0c0 .527-.021 1.049-.064 1.565M12 10.5a14.94 14.94 0 0 1-3.6 9.75m6.633-4.596a18.666 18.666 0 0 1-2.485 5.33" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-center mb-1">{t('forgot_password.set_new_password')}</h2>
                <p className="text-center mb-16">{t('forgot_password.new_password_must_be_8_characters_long')}</p>
                {/* // Step 3: Reset Password */}
                <form onSubmit={handleSubmitStep3(handleResetPassword)}>
                  <div className="mb-6 relative">
                    {/* <label htmlFor="newPassword" className="block text-gray-700">New Password</label> */}
                    <input
                      {...registerStep3('newPassword')}
                      type={passwordVisible ? 'text' : 'password'}
                      id="newPassword"
                      className={`peer w-full border border-teal-500 rounded-lg pl-9 pr-10 py-2 md:py-3 lg:py-3 outline-none focus:border-teal-500 ${errorsStep3.newPassword ? 'border-red-500' : ''}`}
                      placeholder=" "
                    />
                    <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="16" viewBox="0 0 21 16" fill="none">
                        <path d="M8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14C6 12.89 6.89 12 8 12C8.53043 12 9.03914 12.2107 9.41421 12.5858C9.78929 12.9609 10 13.4696 10 14C10 14.5304 9.78929 15.0391 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16ZM14 19V9H2V19H14ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 7.89 0.89 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="#8C8C8C" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-2 md:top-3 lg:top-3 text-gray-400 focus:outline-none"
                    >
                      {passwordVisible
                        ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M11.83 9L15 12.16V12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9H11.83ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.08L19.73 22L21 20.73L3.27 3M12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.35C10.74 7.13 11.35 7 12 7Z" fill="#8C8C8C" />
                          </svg>
                          )
                        : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M14.4375 11C14.4375 11.9117 14.0753 12.786 13.4307 13.4307C12.786 14.0753 11.9117 14.4375 11 14.4375C10.0883 14.4375 9.21398 14.0753 8.56932 13.4307C7.92466 12.786 7.5625 11.9117 7.5625 11C7.5625 10.0883 7.92466 9.21398 8.56932 8.56932C9.21398 7.92466 10.0883 7.5625 11 7.5625C11.9117 7.5625 12.786 7.92466 13.4307 8.56932C14.0753 9.21398 14.4375 10.0883 14.4375 11Z" fill="#8C8C8C" />
                            <path d="M0 11C0 11 4.125 3.4375 11 3.4375C17.875 3.4375 22 11 22 11C22 11 17.875 18.5625 11 18.5625C4.125 18.5625 0 11 0 11ZM11 15.8125C12.2764 15.8125 13.5004 15.3055 14.403 14.403C15.3055 13.5004 15.8125 12.2764 15.8125 11C15.8125 9.72365 15.3055 8.49957 14.403 7.59705C13.5004 6.69453 12.2764 6.1875 11 6.1875C9.72365 6.1875 8.49957 6.69453 7.59705 7.59705C6.69453 8.49957 6.1875 9.72365 6.1875 11C6.1875 12.2764 6.69453 13.5004 7.59705 14.403C8.49957 15.3055 9.72365 15.8125 11 15.8125V15.8125Z" fill="#8C8C8C" />
                          </svg>
                          )}
                    </button>
                    <label
                      htmlFor="newPassword"
                      className="absolute left-9 text-base md:text-lg lg:text-2xl text-teal-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-teal-500 peer-focus:lg:text-2xl"
                    >
                      {t('forgot_password.new_password')}
                    </label>
                    <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                      {errorsStep3.newPassword && <p className="text-red-500 text-xs">{errorsStep3.newPassword.message}</p>}
                    </div>
                  </div>
                  <div className="mb-4 relative">
                    {/* <label htmlFor="confirmPassword" className="block text-gray-700">Confirm Password</label> */}
                    <input
                      {...registerStep3('confirmPassword')}
                      type={confirmPasswordVisible ? 'text' : 'password'}
                      id="confirmPassword"
                      className={`peer w-full border border-teal-500 rounded-lg pl-9 pr-10 py-2 md:py-3 lg:py-3 outline-none focus:border-teal-500 ${errorsStep3.confirmPassword ? 'border-red-500' : ''}`}
                      placeholder=""
                    />
                    <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="21" height="16" viewBox="0 0 21 16" fill="none">
                        <path d="M8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14C6 12.89 6.89 12 8 12C8.53043 12 9.03914 12.2107 9.41421 12.5858C9.78929 12.9609 10 13.4696 10 14C10 14.5304 9.78929 15.0391 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16ZM14 19V9H2V19H14ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 7.89 0.89 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z" fill="#8C8C8C" />
                      </svg>
                    </span>
                    <button
                      type="button"
                      onClick={toggleConfirmPasswordVisibility}
                      className="absolute right-2 top-2 md:top-3 lg:top-3 text-gray-400 focus:outline-none"
                    >
                      {confirmPasswordVisible
                        ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M11.83 9L15 12.16V12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9H11.83ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.08L19.73 22L21 20.73L3.27 3M12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.35C10.74 7.13 11.35 7 12 7Z" fill="#8C8C8C" />
                          </svg>
                          )
                        : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M14.4375 11C14.4375 11.9117 14.0753 12.786 13.4307 13.4307C12.786 14.0753 11.9117 14.4375 11 14.4375C10.0883 14.4375 9.21398 14.0753 8.56932 13.4307C7.92466 12.786 7.5625 11.9117 7.5625 11C7.5625 10.0883 7.92466 9.21398 8.56932 8.56932C9.21398 7.92466 10.0883 7.5625 11 7.5625C11.9117 7.5625 12.786 7.92466 13.4307 8.56932C14.0753 9.21398 14.4375 10.0883 14.4375 11Z" fill="#8C8C8C" />
                            <path d="M0 11C0 11 4.125 3.4375 11 3.4375C17.875 3.4375 22 11 22 11C22 11 17.875 18.5625 11 18.5625C4.125 18.5625 0 11 0 11ZM11 15.8125C12.2764 15.8125 13.5004 15.3055 14.403 14.403C15.3055 13.5004 15.8125 12.2764 15.8125 11C15.8125 9.72365 15.3055 8.49957 14.403 7.59705C13.5004 6.69453 12.2764 6.1875 11 6.1875C9.72365 6.1875 8.49957 6.69453 7.59705 7.59705C6.69453 8.49957 6.1875 9.72365 6.1875 11C6.1875 12.2764 6.69453 13.5004 7.59705 14.403C8.49957 15.3055 9.72365 15.8125 11 15.8125V15.8125Z" fill="#8C8C8C" />
                          </svg>
                          )}
                    </button>
                    <label
                      htmlFor="confirmPassword"
                      className="absolute left-9 text-base md:text-lg lg:text-2xl text-teal-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-teal-500 peer-focus:lg:text-2xl"
                    >
                      {t('forgot_password.confirm_password')}
                    </label>
                    <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                      {errorsStep3.confirmPassword && <p className="text-red-500 text-xs">{errorsStep3.confirmPassword.message}</p>}
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2 md:py-3 lg:py-3 px-4 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={16} /> : t('forgot_password.reset_password')}
                  </button>
                </form>
                <div className="flex justify-center mt-4">
                  <button onClick={handleBackToLogin} className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M5.25 11.25H20.25C20.4489 11.25 20.6397 11.329 20.7803 11.4697C20.921 11.6103 21 11.8011 21 12C21 12.1989 20.921 12.3897 20.7803 12.5303C20.6397 12.671 20.4489 12.75 20.25 12.75H5.25C5.05109 12.75 4.86032 12.671 4.71967 12.5303C4.57902 12.3897 4.5 12.1989 4.5 12C4.5 11.8011 4.57902 11.6103 4.71967 11.4697C4.86032 11.329 5.05109 11.25 5.25 11.25Z" fill="black" />
                      <path d="M5.56038 12L11.7809 18.219C11.9217 18.3598 12.0008 18.5508 12.0008 18.75C12.0008 18.9491 11.9217 19.1401 11.7809 19.281C11.64 19.4218 11.449 19.5009 11.2499 19.5009C11.0507 19.5009 10.8597 19.4218 10.7189 19.281L3.96888 12.531C3.89903 12.4613 3.84362 12.3785 3.80581 12.2874C3.768 12.1963 3.74854 12.0986 3.74854 12C3.74854 11.9013 3.768 11.8036 3.80581 11.7125C3.84362 11.6214 3.89903 11.5386 3.96888 11.469L10.7189 4.71897C10.8597 4.57814 11.0507 4.49902 11.2499 4.49902C11.449 4.49902 11.64 4.57814 11.7809 4.71897C11.9217 4.8598 12.0008 5.05081 12.0008 5.24997C12.0008 5.44913 11.9217 5.64014 11.7809 5.78097L5.56038 12Z" fill="black" />
                    </svg>
                    <span>{t('forgot_password.back_to_login')}</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage
