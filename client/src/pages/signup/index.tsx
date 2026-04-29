/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/no-misused-promises */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-unused-vars */

/* PAGE: SIGNUP
   ========================================================================== */
import React, { useCallback, useState, useMemo, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { register as registerUser } from 'api/post/post.api'

import Select from 'react-select'
import ROUTES from 'routes/constant'
import { useForm } from 'react-hook-form'

import { useTranslation } from 'react-i18next'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { toast } from 'react-toastify'

interface FormInputs {
  username: string
  email: string
  password: string
}

/**
 * RegisterPage component handles the user registration process.
 *
 * @author Hien
 * @component
 * @returns {JSX.Element} The rendered RegisterPage component.
 *
 * @property {object} t - The translation function from useTranslation hook.
 * @property {object} i18n - The i18n instance for language management.
 * @property {boolean} passwordVisible - The state for managing the password visibility.
 * @property {string} selectedLanguage - The state for storing the selected language.
 * @property {boolean} isTermsChecked - The state for managing the "Accept Terms" checkbox.
 * @property {string} termsError - The state for storing the terms error message.
 */
const RegisterPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()

  const [passwordVisible, setPasswordVisible] = useState(false)
  const togglePasswordVisibility = () => {
    setPasswordVisible(!passwordVisible)
  }

  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') ?? 'en'
  })

  const [isTermsChecked, setIsTermsChecked] = useState(false)
  const [termsError, setTermsError] = useState<string>('')

  const usernameRegex = /^[a-zA-Z][a-zA-Z0-9_.]*$/

  // Validation schema for the registration form
  const step1Schema = yup.object({
    username: yup
      .string()
      .required(String(t('login.username_not_empty')))
      .matches(usernameRegex, String(t('login.username_invalid'))),
    email: yup
      .string()
      .required(String(t('login.email_not_empty')))
      .email(String(t('login.email_invalid'))),
    password: yup
      .string()
      .required(String(t('login.password_not_empty')))
  })

  // Form methods for the registration form
  const step1Methods = useForm<FormInputs>({
    resolver: yupResolver(step1Schema)
    // mode: 'onChange'
  })

  const { register: registerStep1, handleSubmit: handleSubmitStep1, formState: { errors: errorsStep1 }, reset, setError } = step1Methods

  /**
   * Handles the user registration process.
   *
   * @author Hien
   * @async
   * @param {FormInputs} data - The form input data.
   * @returns {Promise<void>}
   */
  const handleRegister = useCallback(
    async (data: FormInputs) => {
      if (!isTermsChecked) {
        setTermsError(String(t('login.accept_terms')))
        return
      }

      setTermsError('')

      try {
        const response = await registerUser(data)
        if (response.status === 200) {
          reset()
          setIsTermsChecked(false)
          toast.success(t('login.toast.register_success'))
          navigate(ROUTES.login)
        }
      } catch (error: { code: number, message: string } | any) {
        if (error.code === 409) {
          const message = error.message
          if (message === 'Username already exists') {
            setError('username', { type: 'manual', message: String(t('login.username_exists')) })
          } else if (message === 'Email already exists') {
            setError('email', { type: 'manual', message: String(t('login.email_exists')) })
          }
        } else {
          toast.error(t('login.toast.register_failed'))
        }
      }
    },
    [reset, setError, isTermsChecked, t]
  )

  //  Handles the change event for the "Accept Terms" checkbox.
  const handleTermsChange = () => {
    setIsTermsChecked(!isTermsChecked)
    if (termsError) setTermsError('')
  }

  // Change language on selectedLanguage change
  useEffect(() => {
    i18n.changeLanguage(selectedLanguage)
  }, [selectedLanguage, i18n])

  // Language options for the select component
  const languageOptions = useMemo(
    () => [
      { label: 'En', value: 'en', flagUrl: '/assets/images/login/Flag_of_the_United_Kingdom.png' },
      { label: 'Vi', value: 'vi', flagUrl: '/assets/images/login/Flag_of_Vietnam.png' }
    ],
    []
  )

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
      <img src={flagUrl} alt="" className="w-6 h-4" />
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

        // Kiểm tra nếu có lỗi trong form hiện tại thì mới gọi lại revalidation
        if (Object.keys(step1Methods.formState.errors).length > 0) {
          await step1Methods.trigger()
        } else {
          // console.log('No errors, no revalidation needed.')
        }
        if (errorsStep1.username && errorsStep1.username.type === 'manual') {
          setError('username', {
            type: errorsStep1.username.type,
            message: String(t('login.username_exists'))
          })
        }
        if (errorsStep1.email && errorsStep1.email.type === 'manual') {
          setError('email', {
            type: errorsStep1.email.type,
            message: String(t('login.email_exists'))
          })
        }
        if (termsError) {
          setTermsError(String(t('login.accept_terms')))
        }
      } catch (error) {
        console.log('Error during language change or validation', error)
      }
    },
    [i18n, step1Methods, errorsStep1, t, termsError]
  )
  const googleLogin = () => {
    const backendUrl = process.env.REACT_APP_API
    window.location.href = `${backendUrl}/auth/google` // Redirect to the backend for Google authentication
  }
  const microsoftLogin = () => {
    const backendUrl = process.env.REACT_APP_API
    window.location.href = `${backendUrl}/auth/microsoft` // URL của server để bắt đầu quá trình xác thực với Google
  }
  return (
    <div className="flex h-screen items-center justify-center bg-gray-100 overflow-hidden">
      <div className="flex w-full h-full shadow-lg overflow-hidden relative">
        {/* Left Side Image (Chỉ hiển thị trên màn hình lớn hơn) */}
        <div className="hidden md:block w-1/2">
          <img
            src='/assets/images/login/register.png'
            alt="Sign Up Image"
            className="h-full w-full object-cover"
          />
        </div>

        {/* Right Side Form */}
        <div className="flex items-center justify-center w-full md:w-1/2 p-2 bg-white relative md:bg-white md:p-2">
          {/* Background Image for Mobile */}
          <div className="absolute inset-0 md:hidden">
            <img
              src='/assets/images/login/register.png'
              alt="Sign Up Image"
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

            <h2 className="text-2xl md:text-3xl font-semibold text-center text-blue-500 mb-20">{t('login.welcome')}</h2>

            <form onSubmit={handleSubmitStep1(handleRegister)}>
              {/* Name Field */}
              <div className="relative mb-6">
                <input
                  type="text"
                  id="Username"
                  className={`peer w-full border border-blue-500 rounded-lg pl-9 py-2 md:py-3 lg:py-3 outline-none focus:border-blue-500 ${errorsStep1.username ? 'border-red-500' : ''}`}
                  {...registerStep1('username')}
                  placeholder=" "
                />
                <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                  >
                    <path
                      d="M8 0C9.06087 0 10.0783 0.421427 10.8284 1.17157C11.5786 1.92172 12 2.93913 12 4C12 5.06087 11.5786 6.07828 10.8284 6.82843C10.0783 7.57857 9.06087 8 8 8C6.93913 8 5.92172 7.57857 5.17157 6.82843C4.42143 6.07828 4 5.06087 4 4C4 2.93913 4.42143 1.92172 5.17157 1.17157C5.92172 0.421427 6.93913 0 8 0ZM8 2C7.46957 2 6.96086 2.21071 6.58579 2.58579C6.21071 2.96086 6 3.46957 6 4C6 4.53043 6.21071 5.03914 6.58579 5.41421C6.96086 5.78929 7.46957 6 8 6C8.53043 6 9.03914 5.78929 9.41421 5.41421C9.78929 5.03914 10 4.53043 10 4C10 3.46957 9.78929 2.96086 9.41421 2.58579C9.03914 2.21071 8.53043 2 8 2ZM8 9C10.67 9 16 10.33 16 13V16H0V13C0 10.33 5.33 9 8 9ZM8 10.9C5.03 10.9 1.9 12.36 1.9 13V14.1H14.1V13C14.1 12.36 10.97 10.9 8 10.9Z"
                      fill="#8C8C8C"
                    />
                  </svg>
                </span>
                <label
                  htmlFor="Username"
                  className="absolute left-9 text-base md:text-lg lg:text-2xl text-blue-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-blue-500 peer-focus:lg:text-2xl"
                >
                  {t('login.username')}
                </label>
                <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                {errorsStep1.username && (
                  <p className="text-red-500 text-xs">{errorsStep1.username.message}</p>
                )}
                </div>
              </div>

              {/* Email Field */}
              <div className="relative mb-6">
                <input
                  type="text"
                  id="Enter your email address"
                  className={`peer w-full border border-blue-500  rounded-lg pl-9 py-2 md:py-3 lg:py-3 outline-none focus:border-blue-500 ${errorsStep1.email ? 'border-red-500' : ''}`}
                  {...registerStep1('email')}
                  placeholder=" "
                />
                <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="16"
                    viewBox="0 0 20 16"
                    fill="none"
                  >
                    <path
                      d="M20 2C20 0.9 19.1 0 18 0H2C0.9 0 0 0.9 0 2V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V2ZM18 2L10 7L2 2H18ZM18 14H2V4L10 9L18 4V14Z"
                      fill="#8C8C8C"
                    />
                  </svg>
                </span>
                <label
                  htmlFor="Enter your email address"
                  className="absolute left-9 text-base md:text-lg lg:text-2xl text-blue-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-blue-500 peer-focus:lg:text-2xl"
                >
                  {t('login.enter_your_email_address')}
                </label>
                <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                {errorsStep1.email && (
                  <p className="text-red-500 text-xs">{errorsStep1.email.message}</p>
                )}
                </div>
              </div>

              {/* Password Field */}
              <div className="relative mb-4">
                <input
                  type={passwordVisible ? 'text' : 'password'}
                  id="password"
                  className={`peer w-full border border-blue-500 rounded-lg pl-9 pr-10 py-2 md:py-3 lg:py-3 outline-none focus:border-blue-500 ${errorsStep1.password ? 'border-red-500' : ''}`}
                  {...registerStep1('password')}
                  placeholder=" "
                />
                <span className="absolute left-3 top-3 md:top-4 lg:top-4 text-gray-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="21"
                    height="16"
                    viewBox="0 0 21 16"
                    fill="none"
                  >
                    <path
                      d="M8 16C7.46957 16 6.96086 15.7893 6.58579 15.4142C6.21071 15.0391 6 14.5304 6 14C6 12.89 6.89 12 8 12C8.53043 12 9.03914 12.2107 9.41421 12.5858C9.78929 12.9609 10 13.4696 10 14C10 14.5304 9.78929 15.0391 9.41421 15.4142C9.03914 15.7893 8.53043 16 8 16ZM14 19V9H2V19H14ZM14 7C14.5304 7 15.0391 7.21071 15.4142 7.58579C15.7893 7.96086 16 8.46957 16 9V19C16 19.5304 15.7893 20.0391 15.4142 20.4142C15.0391 20.7893 14.5304 21 14 21H2C1.46957 21 0.960859 20.7893 0.585786 20.4142C0.210714 20.0391 0 19.5304 0 19V9C0 7.89 0.89 7 2 7H3V5C3 3.67392 3.52678 2.40215 4.46447 1.46447C5.40215 0.526784 6.67392 0 8 0C8.65661 0 9.30679 0.129329 9.91342 0.380602C10.52 0.631876 11.0712 1.00017 11.5355 1.46447C11.9998 1.92876 12.3681 2.47995 12.6194 3.08658C12.8707 3.69321 13 4.34339 13 5V7H14ZM8 2C7.20435 2 6.44129 2.31607 5.87868 2.87868C5.31607 3.44129 5 4.20435 5 5V7H11V5C11 4.20435 10.6839 3.44129 10.1213 2.87868C9.55871 2.31607 8.79565 2 8 2Z"
                      fill="#8C8C8C"
                    />
                  </svg>
                </span>
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute right-2 top-2 md:top-3 lg:top-3 text-gray-400 focus:outline-none"
                >
                  {passwordVisible
                    ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M11.83 9L15 12.16V12C15 11.2044 14.6839 10.4413 14.1213 9.87868C13.5587 9.31607 12.7956 9 12 9H11.83ZM7.53 9.8L9.08 11.35C9.03 11.56 9 11.77 9 12C9 12.7956 9.31607 13.5587 9.87868 14.1213C10.4413 14.6839 11.2044 15 12 15C12.22 15 12.44 14.97 12.65 14.92L14.2 16.47C13.53 16.8 12.79 17 12 17C10.6739 17 9.40215 16.4732 8.46447 15.5355C7.52678 14.5979 7 13.3261 7 12C7 11.21 7.2 10.47 7.53 9.8ZM2 4.27L4.28 6.55L4.73 7C3.08 8.3 1.78 10 1 12C2.73 16.39 7 19.5 12 19.5C13.55 19.5 15.03 19.2 16.38 18.66L16.81 19.08L19.73 22L21 20.73L3.27 3M12 7C13.3261 7 14.5979 7.52678 15.5355 8.46447C16.4732 9.40215 17 10.6739 17 12C17 12.64 16.87 13.26 16.64 13.82L19.57 16.75C21.07 15.5 22.27 13.86 23 12C21.27 7.61 17 4.5 12 4.5C10.6 4.5 9.26 4.75 8 5.2L10.17 7.35C10.74 7.13 11.35 7 12 7Z"
                          fill="#8C8C8C"
                        />
                      </svg>
                      )
                    : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <path
                          d="M14.4375 11C14.4375 11.9117 14.0753 12.786 13.4307 13.4307C12.786 14.0753 11.9117 14.4375 11 14.4375C10.0883 14.4375 9.21398 14.0753 8.56932 13.4307C7.92466 12.786 7.5625 11.9117 7.5625 11C7.5625 10.0883 7.92466 9.21398 8.56932 8.56932C9.21398 7.92466 10.0883 7.5625 11 7.5625C11.9117 7.5625 12.786 7.92466 13.4307 8.56932C14.0753 9.21398 14.4375 10.0883 14.4375 11Z"
                          fill="#8C8C8C"
                        />
                        <path
                          d="M0 11C0 11 4.125 3.4375 11 3.4375C17.875 3.4375 22 11 22 11C22 11 17.875 18.5625 11 18.5625C4.125 18.5625 0 11 0 11ZM11 15.8125C12.2764 15.8125 13.5004 15.3055 14.403 14.403C15.3055 13.5004 15.8125 12.2764 15.8125 11C15.8125 9.72365 15.3055 8.49957 14.403 7.59705C13.5004 6.69453 12.2764 6.1875 11 6.1875C9.72365 6.1875 8.49957 6.69453 7.59705 7.59705C6.69453 8.49957 6.1875 9.72365 6.1875 11C6.1875 12.2764 6.69453 13.5004 7.59705 14.403C8.49957 15.3055 9.72365 15.8125 11 15.8125V15.8125Z"
                          fill="#8C8C8C"
                        />
                      </svg>
                      )}
                </button>
                <label
                  htmlFor="password"
                  className="absolute left-9 text-base md:text-lg lg:text-2xl text-blue-500 transition-all duration-200 transform -translate-y-6 -translate-x-8 scale-75 origin-top-left peer-placeholder-shown:translate-x-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:top-1/2 peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-400 peer-placeholder-shown:font-normal peer-focus:-translate-y-6 peer-focus:-translate-x-9 peer-focus:scale-75 peer-focus:top-0 peer-focus:text-lg peer-focus:text-blue-500 peer-focus:lg:text-2xl"
                >
                  {t('login.password')}
                </label>
                <div className="min-h-[1.25rem] mt-1"> {/* Ensure space for error message */}
                {errorsStep1.password && (
                  <p className="text-red-500 text-xs">{errorsStep1.password.message}</p>
                )}
                </div>
              </div>

              {/* Terms & Conditions */}
              <div className="flex flex-col mb-4">
                <div className="flex items-center justify-between">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="form-checkbox text-blue-500"
                      checked={isTermsChecked}
                      onChange={handleTermsChange}
                    />
                    <span className="ml-2 text-gray-600">
                      {t('login.i_gree_to_the')}
                      <a href="#" className="text-blue-500 hover:underline px-1">
                        {t('login.term_monditions')}
                      </a>
                    </span>
                  </label>
                </div>
                {termsError && (
                  <div className="mt-1">
                    <p className="text-red-500">{termsError}</p>
                  </div>
                )}
              </div>

              {/* Register Button */}
              <button
                type="submit"
                className="w-full py-2 md:py-3 lg:py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg"
              >
                {t('login.sign_up')}
              </button>
            </form>

            {/* <div className="mt-6 flex items-center justify-center">
              <hr className="w-full border-t border-gray-400 mr-2" />
              <span className="text-gray-400">{t('login.or')}</span>
              <hr className="w-full border-t border-gray-400 ml-2" />
            </div>
            <div className="mt-4 flex items-center justify-center space-x-4">
              <button
                className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 border rounded-full"
                onClick={googleLogin}
              >
                <img src='/assets/images/login/google-icon.png' alt="Google" className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14" />
              </button>
              <button className="flex items-center justify-center h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14 border rounded-full"
                onClick={microsoftLogin}
              >
                <img src='/assets/images/login/teams-icon.png' alt="Teams" className="h-10 w-10 md:h-12 md:w-12 lg:h-14 lg:w-14" />
              </button>
            </div> */}

            <div className="mt-4 text-center">
              <p className="text-gray-600">
                {t('login.have_account')}{' '}
                <Link to="/login" className="text-teal-500 hover:underline">
                  {t('login.login')}
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
