/* POST API INTERFACES
   ========================================================================== */
import { IBaseResponse } from '../interfaces'
export interface IPostData {
  createdAt: string
  name: string
  id: string
}
export interface IPostResponse extends IBaseResponse {
  data: IPostData
}
export interface IPostListResponse extends IBaseResponse {
  data: IPostData[]
}
export type ExamItem = Record<string, any>
export type CourseItem = Record<string, any>
export interface DataListExam {
  data: ExamItem[]
  page: number
  size: number
  totalRecords: number
}
export interface UserWithDoneCourseParam {
  page: number
  size: number
  userSearch: string
  courseSearch: string
  groupSearch: string
}
export interface ListExamParams {
  page?: number
  search?: string
}
export interface DataListCourse {
  data: CourseItem[]
  page: number
  size: number
  totalRecords: number
}
export interface ListCourseParams {
  page?: number
  search?: string
  startDate?: Date
  endDate?: Date
  category?: string
}
export type User = Record<string, any>
export interface DataListUser {
  totalPages: number
  data: User[]
  page: number
  size: number
  totalRecords: number
  totalPage: number
}
export type Course = Record<string, any>
export interface ListUserParams {
  page?: number
  size?: number
  search?: string
  sortKey?: keyof DataListUser | null
  sortDirection?: 'ASC' | 'DESC' | 'none'
}
export type Permission = Record<string, any>
export interface DataListPermission {
  totalPages: number
  data: Permission[]
  page: number
  size: number
  totalRecords: number
  totalPage: number
};
export interface ListPermissionParams {
  page?: number
  search?: string
  sortKey?: keyof DataListUser | null
  sortDirection?: 'ASC' | 'DESC' | 'none'
}
export interface CourseDone {
  courseId: number
  courseName: string
}
export interface UserWithDoneCourse {
  userId: number
  email: string
  name: string
  groupName: string
  courseDones: CourseDone[]
  coursesCount: number
}
export interface DataListUserWithDoneCourse {
  [x: string]: any
  currentPage: number
  pageSize: number
  totalPages: number
  totalRecords: number
  data: UserWithDoneCourse[]
}
export interface newQuestion {
  examId?: number
  instruction: string
  content: string
  type: string
  a?: string
  b?: string
  c?: string
  d?: string
  e?: string
  f?: string
  g?: string
  h?: string
  i?: string
  j?: string
  k?: string
  l?: string
  m?: string
  n?: string
  o?: string
  p?: string
  answer: string
  explanation: string
  category?: string
}

export interface Exam {
  id: number
  name: string
  courseId?: number
  groupId?: number
  description?: string
}

export interface ExamApiResponse {
  data: Exam[]
  meta: {
    totalRowCount: number
  }
}

export interface Answer {
  id: string
  content: string
  isCorrect: boolean
}

export interface Question {
  id: number
  instruction: string
  content: string
  type: string
  a: string
  b: string
  c: string
  d: string
  e: string
  f: string
  g: string
  h: string
  i: string
  j: string
  k: string
  l: string
  m: string
  n: string
  o: string
  p: string
  answer: string
  explanation: string
  answers?: Answer[]
  originalIndex?: number
  Exams?: Exam[]
  category?: string
}

export interface StatisticExam {
  userInfo: {
    id: number
    fullName: string
    email: string
  }
  attempts: Array<{
    attempt: number
    score: number
    exitTime: string | null
    enterTime: string | null
    expireTime: string | null
  }>
  name: string
  numberOfAttempt: number
  pointToPass: number
}

export interface StatisticExamApiResponse {
  data: StatisticExam[]
  meta: {
    totalRowCount: number
  }
}
