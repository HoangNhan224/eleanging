/* eslint-disable @typescript-eslint/strict-boolean-expressions */
/* ROUTES COMPONENT
   ========================================================================== */

import AuthRoute from 'containers/auth/auth-route'
import LayoutDefault from 'containers/layouts/default'
import Loading from 'containers/loadable-fallback/loading'
import ROUTES from './constant'
import { RouteObject } from 'react-router-dom'
import loadable from '@loadable/component'
import React from 'react'
// import HomePage from 'pages/homePage'
/**
    * Lazy load page components. Fallback to <Loading /> when in loading phase
    */
const Home = loadable(async () => await import('pages/home'), {
  fallback: <Loading />
})
const Login = loadable(async () => await import('pages/login'), {
  fallback: <Loading />
})
const NotFound = loadable(async () => await import('pages/not-found'), {
  fallback: <Loading />
})
const Detail = loadable(async () => await import('pages/detail'), {
  fallback: <Loading />
})
const ExamHistory = loadable(async () => await import('pages/examHistory'), {
  fallback: <Loading />
})
// TODO: remove later
const Dashboard = loadable(async () => await import('pages/dashboard'), {
  fallback: <Loading />
})
const MyCourse = loadable(async () => await import('pages/myCourse'), {
  fallback: <Loading />
})
const HomePage = loadable(async () => await import('pages/homePage'), {
  fallback: <Loading />
})
const CourseDetail = loadable(async () => await import('pages/courseDetail'), {
  fallback: <Loading />
})
const Learning = loadable(async () => await import('pages/learning'), {
  fallback: <Loading />
})
const User = loadable(async () => await import('pages/user'), {
  fallback: <Loading />
})
const Permission = loadable(async () => await import('pages/permission'), {
  fallback: <Loading />
})
const Profile = loadable(async () => await import('pages/settings/Profile'), {
  fallback: <Loading />
})
const UserDashboard = loadable(async () => await import('pages/dashboard/user_dashboard'), {
  fallback: <Loading />
})
const Lession = loadable(async () => await import('pages/lession'), {
  fallback: <Loading />
})

const AddLession = loadable(async () => await import('pages/lession/components/AddLessionPage'), {
  fallback: <Loading />
})

const EditLession = loadable(async () => await import('pages/lession/components/AddLessionPage'), {
  fallback: <Loading />
})

const Signup = loadable(async () => await import('pages/signup'), {
  fallback: <Loading />
})

const ForgotPassword = loadable(async () => await import('pages/forgotPassword'), {
  fallback: <Loading />
})
// course
const Course = loadable(async () => await import('pages/course'), {
  fallback: <Loading />
})
const AddCourseForm = loadable(async () => await import('pages/course/AddCourse'), {
  fallback: <Loading />
})

const EditCourseFrom = loadable(async () => await import('pages/course/EditCourse'), {
  fallback: <Loading />
})
// categorycourse
const CategoryCourse = loadable(async () => await import('pages/categoryCourse'), {
  fallback: <Loading />
})
// categoryLeesion
const CategoryLeesion = loadable(async () => await import('pages/categoryLession'), {
  fallback: <Loading />
})
const GroupExamList = loadable(async () => await import('pages/group_exam_list'), {
  fallback: <Loading />
})
const GroupExamDetail = loadable(async () => await import('pages/group_exam_detail'), {
  fallback: <Loading />
})
const ExamResult = loadable(async () => await import('pages/exam_result'), {
  fallback: <Loading />
})
const QuestionManagement = loadable(async () => await import('pages/questionManagement'), {
  fallback: <Loading />
})

const Banner = loadable(async () => await import('pages/banner'), {
  fallback: <Loading />
})

const ExamManagement = loadable(async () => await import('pages/examManagement'), {
  fallback: <Loading />
})

const ExamEdit = loadable(async () => await import('pages/examManagement/components/ExamEditor'), {
  fallback: <Loading />
})

const ExamAdd = loadable(async () => await import('pages/examManagement/components/ExamAdd'), {
  fallback: <Loading />
})

const CommentQuestion = loadable(async () => await import('pages/commentQuestion'), {
  fallback: <Loading />
})

const ProgressDashboard = loadable(async () => await import('pages/progressDashboard'), {
  fallback: <Loading />
})

const routes: RouteObject[] = [
  {
    path: ROUTES.login,
    element: (
         <AuthRoute>
           <Login />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.signup,
    element: (
         <AuthRoute>
           <Signup />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.forgotpassword,
    element: (
         <AuthRoute>
           <ForgotPassword />
         </AuthRoute>
    )
  },
  {
    path: ROUTES.homePage,
    element: (
         <AuthRoute>
           <LayoutDefault />
         </AuthRoute>
    ),
    children: [
      { index: true, element: <HomePage /> },
      { path: ROUTES.detail, element: <Detail /> },
      { path: ROUTES.examHistory, element: <ExamHistory /> },
      { path: ROUTES.dashboard, element: <Dashboard /> }, // TODO: remove later
      { path: ROUTES.notfound, element: <NotFound /> },
      { path: ROUTES.myCourse, element: <MyCourse /> },
      { path: ROUTES.home, element: <Home /> },
      { path: ROUTES.courseDetail, element: <CourseDetail /> },
      { path: ROUTES.learning, element: <Learning /> },
      { path: ROUTES.profile, element: <Profile /> },
      { path: ROUTES.userDashboard, element: <UserDashboard /> },
      { path: ROUTES.group_exam_list, element: <GroupExamList /> },
      { path: ROUTES.group_exam_detail, element: <GroupExamDetail /> },
      { path: ROUTES.exam_result, element: <ExamResult /> },
      { path: ROUTES.comment_question, element: <CommentQuestion /> },
      {
        path: ROUTES.examEdit,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <ExamEdit />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.examAdd,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <ExamAdd />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.lession,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <Lession />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.addLession,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <AddLession />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.editLession,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
            <EditLession />
          </AuthRoute>
        )
      },
      {
        path: ROUTES.permission,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
               <Permission />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.userDashboard,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
               <UserDashboard />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.progressDashboard,
        element: (
          <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <ProgressDashboard />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.user,
        element: (
          <AuthRoute allowedRoles={['ADMIN']}>
               <User />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.course,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <Course />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.addCourse,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <AddCourseForm />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.editCoursePage,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <EditCourseFrom />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.categoryCourse,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <CategoryCourse />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.categorylession,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <CategoryLeesion />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.examManagement,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <ExamManagement />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.questionManagement,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <QuestionManagement />
             </AuthRoute>
        )
      },
      {
        path: ROUTES.banner,
        element: (
             <AuthRoute allowedRoles={['ADMIN', 'MANAGER']}>
               <Banner />
             </AuthRoute>
        )
      },
      { path: ROUTES.notfound, element: <NotFound /> },
      // course
      { path: ROUTES.course, element: <Course /> },
      { path: ROUTES.addCourse, element: <AddCourseForm /> },
      { path: ROUTES.editCoursePage, element: <EditCourseFrom /> },
      // categorycourse
      { path: ROUTES.categoryCourse, element: <CategoryCourse /> }
    ]
  }
]

export default routes
