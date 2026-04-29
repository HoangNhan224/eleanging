/* eslint-disable @typescript-eslint/promise-function-async */
/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable @typescript-eslint/no-floating-promises */
/* eslint-disable prefer-promise-reject-errors */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */

import axios, { AxiosError } from 'axios'
import { getFromLocalStorage, setToLocalStorage, removeAllLocalStorage, reload } from 'utils/functions'
import { refresh } from 'api/post/post.api'
import { jwtDecode } from 'jwt-decode'
import Swal from 'sweetalert2'
import { toast } from 'react-toastify'
import i18n from 'i18next'
import store from '../redux/store'
import { refreshTokenThunk, clearAuthData } from '../redux/auth/authSlice'

/**
 * Interface for the base structure of error responses from the API.
 *
 * @author Canh
 */
interface IBaseErrorResponse {
  code: string
  status: number
  message: string
  examId?: string
}

// Flags to prevent duplicate notifications
let isTokenExpiredNotified = false
let isForbiddenNotified = false

/**
 * Resets notification flags after a delay to avoid spamming the user with repeated warnings.
 *
 * @author Canh
 */
const resetFlags = () => {
  setTimeout(() => {
    isTokenExpiredNotified = false
    isForbiddenNotified = false
  }, 3000)
}

/**
 * Axios instance for making requests that require JWT authentication.
 *
 * @author Canh
 */
export const requestWithJwt = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 10000,
  withCredentials: false
})

/**
 * Checks if a JWT token is valid based on its expiration time.
 *
 * @author Canh
 * @param {string} token - The JWT token to check.
 * @returns {boolean} - True if valid, false otherwise.
 */
const checkTokenValidity = (token: string): boolean => {
  try {
    const { exp } = jwtDecode<{ exp: number }>(token)
    return exp * 1000 > Date.now()
  } catch (error) {
    return false
  }
}

/**
 * Handles the logic for refreshing the JWT token.
 * If the access token is valid, it is returned.
 * Otherwise, attempts to refresh the token. On failure, prompts the user to login again.
 *
 * @author Canh
 * @returns {Promise<string | null>} - The new access token or null if unsuccessful.
 */
const handleTokenRefresh = async (): Promise<string | null> => {
  const tokens = getFromLocalStorage<any>('tokens')
  if (tokens?.accessToken && checkTokenValidity(tokens.accessToken)) {
    return tokens.accessToken
  }
  if (!tokens) return null

  try {
    const resultAction = await store.dispatch(refreshTokenThunk())

    if (refreshTokenThunk.fulfilled.match(resultAction)) {
      return resultAction.payload.accessToken
    } else {
      Swal.fire({
        title: i18n.t('Swal.title.auth') ?? '',
        text: i18n.t('Swal.text.auth') ?? '',
        icon: 'warning',
        confirmButtonText: i18n.t('Swal.confirm') ?? '',
        confirmButtonColor: '#22C55E',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          reload()
        }
      })
      return null
    }
  } catch (error) {
    if (!isTokenExpiredNotified) {
      isTokenExpiredNotified = true
      Swal.fire({
        title: i18n.t('Swal.title.auth') ?? '',
        text: i18n.t('Swal.text.auth') ?? '',
        icon: 'warning',
        confirmButtonText: i18n.t('Swal.confirm') ?? '',
        confirmButtonColor: '#22C55E',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          removeAllLocalStorage()
          store.dispatch(clearAuthData())
          reload()
        }
      })
      resetFlags()
    }
    return null
  }
}

const handleTokenRefreshChangeRolePermission = async () => {
  const tokens = getFromLocalStorage<any>('tokens')
  if (!tokens) {
    return null
  }
  try {
    const resultAction = await store.dispatch(refreshTokenThunk())

    if (refreshTokenThunk.fulfilled.match(resultAction)) {
      return resultAction.payload.accessToken
    } else {
      Swal.fire({
        title: i18n.t('Swal.title.auth') ?? '',
        text: i18n.t('Swal.text.auth') ?? '',
        icon: 'warning',
        confirmButtonText: i18n.t('Swal.confirm') ?? '',
        confirmButtonColor: '#22C55E',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          reload()
        }
      })
      return null
    }
  } catch (error) {
    if (!isTokenExpiredNotified) {
      isTokenExpiredNotified = true
      Swal.fire({
        title: i18n.t('Swal.title.auth') ?? '',
        text: i18n.t('Swal.text.auth') ?? '',
        icon: 'warning',
        confirmButtonText: i18n.t('Swal.confirm') ?? '',
        confirmButtonColor: '#22C55E',
        allowOutsideClick: false
      }).then((result) => {
        if (result.isConfirmed) {
          removeAllLocalStorage()
          store.dispatch(clearAuthData())
          reload()
        }
      })
      return null
    }
  }
}

/**
 * Attaches the JWT access token from local storage to the Authorization header of the request.
 *
 * @author Canh
 * @param {object} config - Axios request configuration object.
 * @returns {object} - Updated Axios config with Authorization header.
 */
const attachAccessToken = (config: any) => {
  const { accessToken } = getFromLocalStorage<any>('tokens')
  let token = ''
  if (accessToken != null) {
    token = accessToken
  }
  return {
    ...config,
    headers: {
      Authorization: `Bearer ${token}`,
      ...config.headers
    }
  }
}

/**
 * Handles response errors, including token expiration and forbidden access.
 * For 401 errors, attempts to refresh the token and retry the request.
 * For 403 errors, shows a warning notification.
 * For unknown errors, returns a generic error object.
 *
 * @author Canh
 * @param {AxiosError<IBaseErrorResponse>} error - The Axios error object.
 * @param {any} instance - The Axios instance used to retry requests if necessary.
 * @returns {Promise<any>} - Promise that rejects with standardized error data.
 */
const handleErrorInterceptor = async (error: AxiosError<IBaseErrorResponse>, instance: any) => {
  const originalRequest: any = error.config

  if (error.response?.status === 401 && !originalRequest._retry) {
    originalRequest._retry = true
    try {
      const newAccessToken = await handleTokenRefresh()
      if (newAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return instance(originalRequest)
      }
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }

  if (error.response?.status === 403 && !isForbiddenNotified) {
    isForbiddenNotified = true
    toast.warn(i18n.t('profile.toast.forbidden'))
  }
  // if (error.response?.status === 404) {
  //   await handleTokenRefreshChangeRolePermission()
  // }
  if (error.response?.status === 404 && !originalRequest._retry404) {
    originalRequest._retry404 = true

    try {
      const newAccessToken = await handleTokenRefreshChangeRolePermission()
      if (newAccessToken) {
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        }
        return requestWithJwt(originalRequest)
      }
    } catch (refreshError) {
      return Promise.reject(refreshError)
    }
  }
  if (
    error.response?.status === 423 &&
    error.response?.data?.examId &&
    !isForbiddenNotified
  ) {
    isForbiddenNotified = true
    toast.warn(i18n.t('exam.toast_exam_forbidden'))
    localStorage.removeItem(`exam_session_${error.response.data.examId}`)
    setTimeout(() => {
      window.location.href = '/'
    }, 2000)
  }

  resetFlags()

  if (!error.response?.data) {
    console.error('Unknown server error')
    return Promise.reject({
      code: 'Unknown',
      status: 500,
      message: 'Server error'
    })
  }

  return Promise.reject(error.response.data)
}

// Attach interceptors to the requestWithJwt instance
requestWithJwt.interceptors.request.use(attachAccessToken)
requestWithJwt.interceptors.response.use(
  (response) => response,
  (error) => handleErrorInterceptor(error, requestWithJwt)
)

/**
 * Axios instance for making requests that do NOT require JWT authentication.
 * Suitable for public endpoints or authentication actions (e.g., login, register).
 *
 * @author Canh
 */
export const requestWithoutJwt = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 10000,
  withCredentials: false
})

requestWithoutJwt.interceptors.response.use(
  (response) => response,
  (error: AxiosError<IBaseErrorResponse>) => {
    if (error.response?.status === 403 && !isForbiddenNotified) {
      isForbiddenNotified = true
      toast.warn(i18n.t('profile.toast.forbidden'))
    }
    resetFlags()
    return Promise.reject(error.response?.data)
  }
)

/**
 * Axios instance for handling file upload requests, with longer timeout and JWT authentication.
 *
 * @author Canh
 */
export const requestUpload = axios.create({
  baseURL: process.env.REACT_APP_API,
  timeout: 30000,
  withCredentials: false
})

requestUpload.interceptors.request.use(attachAccessToken)
requestUpload.interceptors.response.use(
  (response) => response,
  (error) => handleErrorInterceptor(error, requestUpload)
)
