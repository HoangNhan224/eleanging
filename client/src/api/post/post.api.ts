/* eslint-disable @typescript-eslint/return-await */
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* POST API REQUESTS
   ========================================================================== */

import { requestWithJwt, requestWithoutJwt, requestUpload } from '../request'

import axios, { AxiosResponse } from 'axios'
import { DataListCourse, ListCourseParams, DataListExam, DataListUser, ListExamParams, ListUserParams, DataListPermission, ListPermissionParams, UserWithDoneCourseParam, DataListUserWithDoneCourse, newQuestion, ExamApiResponse, StatisticExamApiResponse } from './post.interface'

export const getListExams = async ({
  params
}: {
  params?: ListExamParams
}): Promise<AxiosResponse<DataListExam>> => {
  return await requestWithJwt.get<DataListExam>('/exams', { params })
}
export const getFlaggedQuestions = async ({
  id,
  attempt
}: {
  id: string
  attempt?: string | null
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(
    attempt != null
      ? `/exams/${id}/${attempt}/flagged-ids`
      : `/exams/${id}/flagged-ids`
  )
}
export const getTemptAnswers = async ({
  id,
  attempt
}: {
  id: string
  attempt?: string | null
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(
    attempt != null
      ? `/exams/${id}/${attempt}/tempt-answers`
      : `/exams/${id}/tempt-answers`
  )
}
export const getDetailExams = async ({
  id, attempt, status, page, limit
}: {
  id?: string
  attempt?: string | null
  status?: string | null
  page?: number
  limit?: number
}): Promise<AxiosResponse<any>> => {
  try {
    const sessionId = localStorage.getItem(`exam_session_${id}`)
    const config = {
      headers: {
        'x-exam-session-id': sessionId ?? ''
      }
    }
    const params = new URLSearchParams()
    if (status) params.append('status', status)
    if (page) params.append('page', page.toString())
    if (limit) params.append('limit', limit.toString())

    const response = await requestWithJwt.get<any>(
      `/exams/${id}${attempt ? `/${attempt}` : ''}${params.toString() ? `?${params.toString()}` : ''}`,
      config
    )

    if (response.data.sessionId) {
      localStorage.setItem(`exam_session_${id}`, response.data.sessionId)
    }

    return response
  } catch (error: any) {
    if (error.response?.status === 409 &&
      error.response?.data?.error === 'INVALID_SESSION') {
      localStorage.removeItem(`exam_session_${id}`)
    }
    throw error
  }
}
export const checkAttemptAllowed = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/check_attempt_allow/${id}`)
}

export const getShortHistoryExams = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/${id}/getShortHistory`)
}

export const getQuestionDiscussion = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/questions/${id}`)
}

export const getDashboardData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/dashboard')
}

export const saveQuestionsForExam = async (
  payload: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/dashboard/create', { data: payload })
}

export const login = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/login', { data: payload }, { withCredentials: true })
}

export const register = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/register', { data: payload }, { withCredentials: true })
}

export const refresh = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/auth/refresh', {}, { withCredentials: true })
}

export const logout = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/auth/logout', {}, { withCredentials: true })
}
export const markExam = async (
  id: string,
  payload: any
): Promise<AxiosResponse<any>> => {
  const examSessionId = localStorage.getItem(`exam_session_${id}`)
  const config = {
    headers: {
      'x-exam-session-id': examSessionId
    }
  }
  return await requestWithJwt.post<any>(`/exams/${id}`, { data: payload }, config)
}

export const saveTempAnswer = async (
  id: string,
  payload: any
): Promise<AxiosResponse<any>> => {
  const examSessionId = localStorage.getItem(`exam_session_${id}`)
  const config = {
    headers: {
      'x-exam-session-id': examSessionId
    }
  }
  return await requestWithJwt.post<any>(`/exams/${id}/saveTemporaryAnswer`, { data: payload }, config)
}

export const commentOnQuestion = async (
  questionId: string,
  payload: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>(`/questions/${questionId}`, { data: payload })
}

export const fetchRole = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/roles/')
}

export const createRole = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/roles/', { data: payload })
}
// course
export const getCourseData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/all')
}
export const getCoursesData = async ({
  categorycourseid
}: {
  categorycourseid?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/category_courses/${categorycourseid}`)
}

export const deleteRole = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/roles/${id}`)
}
// course
export const getCourseById = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/${id}`)
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export const updateCourse = async (id: string, data: FormData) => {
  try {
    const response = await requestWithJwt.put(`/courses/${id}`, data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    return response.data
  } catch (error) {
    // Assert the type of error as any to access response property
    const typedError = error as any
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    throw typedError.response?.data || error
  }
}
export const addCourse = async (formData: FormData): Promise<void> => {
  try {
    console.log(formData)
    const response = await requestWithJwt.post('/courses', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
    console.log(response)
  } catch (error: any) {
    if ((Boolean(axios.isAxiosError(error))) && error.response?.status === 409) {
      throw new Error('A course with this name already exists')
    }
    console.error('Failed to add course:', error)
    throw error
  }
}
export const fetchAllPermission = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/permissions/')
}

export const createPermission = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/permissions/', { data: payload })
}

export const updatePermission = async (id: string, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/permissions/${id}`, { data: payload })
}

export const deletePermission = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/permissions/${id}`)
}

export const fetchPermissionByRole = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/permissions/by-role/${id}`)
}

export const assignPermissonToRole = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/permissions/assign-to-role', { data: payload })
}

export const fetchAllUser = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/users/')
}

export const fetchAllRole = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/roles/')
}
export const getListMyCoursesActive = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/myCoursesActive', { params })
}
export const getListMyCoursesDone = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/myCoursesDone', { params })
}
export const createUser = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/users/', { data: payload })
}
export const addProgress = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/learn/addProgress', { data: payload })
}
export const deleteUser = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/users/${id}`)
}

export const updateUser = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/users/${id}`, { data: payload })
}

export const findUserById = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/users/${id}`)
}

export const fetchAllRoute = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/routes/')
}
export const getdeleteCourse = async (categoryId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.delete<any>(`/courses/${categoryId}`)
    return response
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to delete category course')
  }
}
export const fetchPermissionPagination = async ({
  params
}: {
  params?: ListPermissionParams
}): Promise<AxiosResponse<DataListPermission>> => {
  return await requestWithJwt.get<DataListPermission>('/permissions/pagination', { params })
}
export const getListMyCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/myCourses', { params })
}
// course
interface DeleteCoursesResponse {
  coursesUnableToDelete: any
  deletedCourses: any
}
// course
export const deleteCourses = async (ids: string[]): Promise<DeleteCoursesResponse> => {
  try {
    const response = await requestWithJwt.delete('/courses', { data: { ids } })
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (response.data && response.data.message === 'Deleted Course.') {
      const { coursesUnableToDelete, successfullyDeletedCourses } = response.data
      console.log('Courses unable to delete:', coursesUnableToDelete)
      console.log('Successfully deleted courses:', successfullyDeletedCourses)
      return { coursesUnableToDelete, deletedCourses: successfullyDeletedCourses }
    } else {
      console.error('Failed to delete courses:', response.data)
      throw new Error('Failed to delete courses')
    }
  } catch (error) {
    // ??ng nh?p l?i n?u co ngo?i l? x?y ra trong qua trinh xoa
    console.error('Failed to delete courses:', error)
    throw error
  }
}
export const getCategoryCourseData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/course-category')
}
export const getListProCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/paidCourse', { params })
}

export const getListFreeCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/freeCourse', { params })
}

export const getListCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/', { params })
}
export const getListNewCourses = async ({
  params
}: {
  params?: ListCourseParams
}): Promise<AxiosResponse<DataListCourse>> => {
  return await requestWithJwt.get<DataListCourse>('/courses/getNewCourse', { params })
}
export const getCourseDetail = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/courses/${id}`)
}

// categorycourse
export const createCategoryCourse = async (name: string, description: string): Promise<AxiosResponse<CategoryCourse>> => {
  try {
    if (name.trim().length === 0) {
      throw new Error('Name cannot be empty')
    }
    if (description.trim().length === 0) {
      throw new Error('Description cannot be empty')
    }
    const response = await requestWithJwt.post<CategoryCourse>('/categorycourse', { name, description })
    return response
  } catch (error: any) {
    console.error('Error:', error)
    if ((Boolean(error.response)) && error.response.status === 400) {
      throw new Error('Please provide valid name and description')
    } else {
      throw new Error('A course category with this name already exists.')
    }
  }
}
export const fetchAllCourses = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/list')
}

export const fetchAllGroups = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/groups/list')
}
export interface CheckCourseResponse {
  exists: boolean
  message: string
}
export const fetchAllCategorycourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/categorycourse/')
}
// categorycourse
export const deleteCategoryCourse = async (categoryId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.delete<any>(`/categorycourse/${categoryId}`)
    return response
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to delete category course')
  }
}
export const updateCategoryCourse = async (categoryId: string, name: string, description: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.put<any>(`/categorycourse/${categoryId}`, { name, description })
    return response
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to update category course')
  }
}
// categorycourse
interface CategoryCourse {
  id: string
  name: string
  description: string
}
export const getCategoryLessionsByCourse = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getCategoryLessionsByCourse/${id}`)
}

export const getLessionByCategory = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getLessionByCategory/${id}`)
}

export const getLessionsByCategory = async ({
  categoryId
}: {
  categoryId: number
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get(
    `/lessions/category_lesions/${categoryId}/lessions`
  )
}
export const getLessionById = async ({
  id
}: {
  id: number
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get(
    `/lessions/${id}`)
}
export const addEnrollments = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/learn/addEnrollment', { data: payload })
}

export const getEnrollmentByUserId = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/learn/getEnrollmentByUserId')
}

export const getEnrollmentByCourseId = async ({
  courseId
}: {
  courseId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getEnrollmentByCourseId/${courseId}`)
}

export const getProgressByEnrollmentId = async ({
  id
}: {
  id?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/learn/getProgressByEnrollmentId/${id}`)
}

export const getCourseActiveByUser = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.get<any>('/courses/courseActiveByUser', { data: payload })
}
export const markCourseAsDone = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/enrollments/markAsComplete', { data: payload })
}
export const getCourseDoneDashboard = async ({
  params
}: {
  params?: UserWithDoneCourseParam
}): Promise<AxiosResponse<DataListUserWithDoneCourse>> => {
  return await requestWithJwt.get<DataListUserWithDoneCourse>('/enrollments/dashboard', { params })
}

export const fetchUserPagination = async ({
  params
}: {
  params?: ListUserParams
}): Promise<AxiosResponse<DataListUser>> => {
  return await requestWithJwt.get<DataListUser>('/users/pagination', { params })
}
export const getCourse = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/getAllCourse')
}
export const getGroup = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/groups/getAllGroup')
}
export const checkUpdates = async (userId: string, courseId: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/lessions/checkUpdates/${userId}/${courseId}`)
}

export const getFirstIncompleteLessionCourse = async (userId: string, courseId: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/lessions/getFirstIncompleteLessionCourse/${userId}/${courseId}`)
}
export const getNotifications = async (limit: number, offset: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/notifications/getNotiByUserId', {
    params: {
      limit,
      offset
    }
  })
}
export const createNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/notifications/createNotification', { data: payload })
}
export const readNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/readNotification', { data: payload })
}
export const readAllNotification = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/readAllNotification')
}
export const markUnread = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/markAsUnread', { data: payload })
}
export const markAllUnread = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>('/notifications/markAllAsUnread')
}
export const removeNotification = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/notifications/removeNotification', { data: payload })
}
export const removeAllNotification = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/notifications/removeAllNotification')
}

export const getCourseLession = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/lessions/courses')
}

export const getCategoryLessionsByCourseId = async ({
  courseId
}: {
  courseId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/lessions/courses/${courseId}/category_lesions`)
}

export const getLessionsByCategoryLessionId = async ({
  categoryLesionId
}: {
  categoryLesionId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/lessions/category_lesions/${categoryLesionId}/lessions`)
}

export const deleteLessions = async (ids: string[]): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/lessions', { data: { lessionIds: ids } })
}

export const updateLessionOrder = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/lessions/update-lession-order', { data: payload })
}

export const createLession = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/lessions/', { data: payload })
}

export const updateLession = async (id: string, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/lessions/${id}`, { data: payload })
}

export const sendOTP = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/sendOTP', { data: payload }, { withCredentials: true })
}

export const verifyOTP = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/verifyOTP', { data: payload }, { withCredentials: true })
}

export const resetPassword = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithoutJwt.post<any>('/auth/resetPassword', { data: payload }, { withCredentials: true })
}

export const uploadAvatar = async (userId: string, formData: FormData): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>(`/users/avatar/${userId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
// cateoryleesion
export const getCategoryLessionData = async ({
  categorycourseid
}: {
  categorycourseid?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/categorylession/category_lessions/${categorycourseid}`)
}
export const getCourseLessionData = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/categorylession/courses/')
}
// xoa categorylession
export const getdeleteLesion = async (categoryId: string): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.delete<any>(`/categorylession/${categoryId}`)
    return response
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to delete category course')
  }
}
interface CategoryLession {
  id: string
  name: string
  courseId: number
}
export const createCategoryLession = async (name: string, courseId: number): Promise<AxiosResponse<CategoryLession>> => {
  try {
    const response = await requestWithJwt.post<CategoryLession>('/categorylession', { name, courseId })
    return response
  } catch (error: any) {
    console.error('Error:', error)
    if ((Boolean(error.response)) && error.response.status === 400) {
      throw new Error('Please provide valid name and description')
    } else {
      throw new Error('A categoryLession with this name already exists.')
    }
  }
}
export const updateCategoryLesion = async (id: string, name: string, courseId: number): Promise<AxiosResponse<any>> => {
  try {
    const response = await requestWithJwt.put<any>(`/categorylession/${id}`, { name, courseId })
    return response
  } catch (error) {
    console.error('Error:', error)
    throw new Error('Failed to update category course')
  }
}

export const uploadFileInChunks = async (file: File): Promise<{ data: { file: string } }> => {
  const chunkSize = 2 * 1024 * 1024
  const totalChunks = Math.ceil(file.size / chunkSize)
  const uniqueId = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
  let finalFileName = file.name

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize
    const end = Math.min(file.size, start + chunkSize)
    const chunk = file.slice(start, end)
    const formData = new FormData()
    formData.append('file', chunk)
    formData.append('fileName', file.name)
    formData.append('chunkIndex', String(i))
    formData.append('totalChunks', String(totalChunks))
    formData.append('uniqueId', uniqueId)

    try {
      const response = await requestUpload.post('/lessions/chunk-upload', formData)
      const json = response.data
      if (i === totalChunks - 1 && json.success && json?.data.file) {
        finalFileName = json.data.file
      }
    } catch (error: any) {
      console.error('Error uploading chunk:', error)
      throw new Error('Failed to upload file chunk')
    }
  }
  return {
    data: {
      file: finalFileName
    }
  }
}

export const createQuestion = async (payload: newQuestion): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/questions/', payload)
}

export const uploadImg = async (formData: FormData): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/questions/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
  })
}
export const removeQuestion = async (id: string): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/questions/${id}`)
}
export const getQuestionsByCategory = async (params: Record<string, any>): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/questions/filter-by-category', { params })
}
export const updateQuestion = async (id: string, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/questions/${id}`, payload)
}

export const getExamById = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/getExam/${id}`)
}

export const updateExam = async (id: number, payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/exams/${id}`, { data: payload })
}

export const getExams = async ({
  start = 0,
  size = 10,
  filters = '[]',
  globalFilter = '',
  sorting = '[]',
  filterOption = 'COURSE'
}: {
  start?: number
  size?: number
  filters?: string
  globalFilter?: string
  sorting?: string
  filterOption?: 'COURSE' | 'GROUP'
}): Promise<AxiosResponse<ExamApiResponse>> => {
  const params = new URLSearchParams({
    start: start.toString(),
    size: size.toString(),
    filters,
    globalFilter,
    sorting,
    filterOption
  })

  return await requestWithJwt.get<ExamApiResponse>(`/exams/list?${params.toString()}`)
}

export const deleteExams = async (ids: string[]): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/exams', { data: { ExamIds: ids } })
}

export const getCategoryExam = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/categoryexam')
}

export const getAllCourseForExamSelect = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/courses/exam/getAllCourseForExamSelect')
}

export const createExam = async (payload: any): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/exams/', { data: payload })
}

export const uploadImgExam = async (formData: FormData): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>('/exams/upload/image', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    },
    withCredentials: true
  })
}

export const createBulkQuestions = async (questions: any[], category?: string): Promise<AxiosResponse<any>> => {
  if (category) {
    return await requestWithJwt.post<any>('/questions/bulk', { questions, category })
  }
  return await requestWithJwt.post<any>('/questions/bulk', { questions })
}

export const getQuestionExamPagination = async ({
  examId,
  start = 0,
  size = 25
}: {
  examId: number
  start?: number
  size?: number
}): Promise<AxiosResponse<any>> => {
  const params = new URLSearchParams({
    start: start.toString(),
    size: size.toString()
  })
  return await requestWithJwt.get<any>(`/questions/exam/${examId}?${params.toString()}`)
}

export const getQuestionExam = async (id: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/questions/exam/list/${id}`)
}

export const removeQuestionFromExam = async (
  examId: number,
  questionId: string
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>(`/questions/remove-from-exam/${examId}/${questionId}`)
}

export const updateQuestionOrder = async (examId: number, orderData: any[]): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/questions/${examId}/update-order`, { orderData })
}

export const duplicateUpdateOrder = async (
  examId: number,
  payload: {
    leftQuestionIds: string[]
    orderData: Array<{ questionId: string, order: number }>
  }
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.put<any>(`/questions/${examId}/update`, payload)
}

export const removeMultipleQuestions = async (
  questionIds: number[]
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.delete<any>('/questions/delete-bulk', { data: { questionIds } })
}

export const getExamByCourseId = async ({
  courseId
}: {
  courseId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/getExamByCourseId/${courseId}`)
}
export const getExamByGroupId = async ({
  groupId,
  page = 1,
  limit = 10
}: {
  groupId?: string
  page?: number
  limit?: number
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(
    `/exams/getExamByGroupId/${groupId}?page=${page}&limit=${limit}`
  )
}
export const getCourseExam = async (
  courseId?: string,
  name?: string,
  fromDate?: string,
  toDate?: string
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/exams/getCourseExam', {
    params: {
      ...(courseId ? { courseId } : {}),
      ...(name ? { name } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {})
    }
  })
}

export const getGroupExam = async (
  groupId?: string,
  name?: string,
  fromDate?: string,
  toDate?: string
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/exams/getGroupExam', {
    params: {
      ...(groupId ? { groupId } : {}),
      ...(name ? { name } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {})
    }
  })
}

export const getCourseAndGroupExam = async (
  name?: string,
  fromDate?: string,
  toDate?: string
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/exams/getCourseAndGroupExam', {
    params: {
      ...(name ? { name } : {}),
      ...(fromDate ? { fromDate } : {}),
      ...(toDate ? { toDate } : {})
    }
  })
}
export const getAllQuestionsInExam = async (
  examId: string
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/getAllQuestionInExam/${examId}`)
}
export const getUnsubmittedExams = async (
  examId?: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/exams/unsubmitted_exam/${examId}`)
}
export const postSubmitUnsubmittedExam = async (
  examId: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>(`/exams/submit_unsubmitted_exam/${examId}`)
}
export const postSubmitUnsubmittedExamForAdmin = async (
  examId: any
): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.post<any>(`/exams/submit_unsubmitted_exam_admin/${examId}`)
}
const BASE_URL = 'https://libretranslate.com/translate'

export const translateText = async ({
  text,
  targetLang
}: {
  text: string
  targetLang: string
}): Promise<AxiosResponse<any>> => {
  return await axios.post(
    BASE_URL,
    {
      q: text,
      source: 'auto',
      target: targetLang,
      format: 'text'
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      }
    }
  )
}
export const translateMultipleTexts = async ({
  texts,
  targetLang
}: {
  texts: string[]
  targetLang: string
}): Promise<AxiosResponse<any>> => {
  return await axios.post(BASE_URL, {
    q: texts,
    source: 'auto',
    target: targetLang,
    format: 'text'
  })
}

export const detectLanguage = async (text: string): Promise<AxiosResponse<any>> => {
  return await axios.post('https://libretranslate.com/detect', {
    q: text
  })
}

export const getUserScores = async ({
  examId,
  start = 0,
  size = 25,
  globalFilter = ''
}: {
  examId: number
  start?: number
  size?: number
  globalFilter?: string
}): Promise<AxiosResponse<StatisticExamApiResponse>> => {
  const params = new URLSearchParams({
    start: start.toString(),
    size: size.toString(),
    globalFilter
  })

  return await requestWithJwt.get<StatisticExamApiResponse>(
    `/exams/statistic/${examId}/user-scores?${params.toString()}`
  )
}

export const getUserResultDetail = async ({
  userId,
  examId,
  attempt,
  start = 0,
  size = 10
}: {
  userId: string
  examId: string
  attempt: number
  start?: number
  size?: number
}): Promise<AxiosResponse<any>> => {
  const params = new URLSearchParams({
    userId,
    examId,
    attempt: attempt.toString(),
    start: start.toString(),
    size: size.toString()
  })

  return await requestWithJwt.get<any>(`/exams/user-result-detail?${params.toString()}`)
}
export const getQuestionDetails = async (examId: number, questionId: number): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>(`/questions/exam/${examId}/questions/${questionId}`)
}

export const getCourseExamList = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/exams/getCourseExamList')
}

export const getGroupExamList = async (): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/exams/getGroupExamList')
}

export const saveBanner = async (data: {
  type: 'course' | 'group'
  examId: number
  topNumber: number
}): Promise<AxiosResponse<any>> => {
  return requestWithJwt.post('/banner', data)
}

export const getActiveBanner = async (): Promise<AxiosResponse<any>> => {
  return requestWithJwt.get('/banner')
}

export const getBannerTopScore = async (): Promise<AxiosResponse<any>> => {
  return requestWithJwt.get('/banner/top-score')
}

// Admin learning progress
export const getAdminLearningProgress = async (params?: {
  page?: number
  size?: number
  search?: string
  courseId?: string
  status?: string
  groupId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/admin-learning-progress', { params })
}

export const getProgressSummary = async (params?: {
  courseId?: string
}): Promise<AxiosResponse<any>> => {
  return await requestWithJwt.get<any>('/admin-learning-progress/summary', { params })
}
