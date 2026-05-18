/* ROUTE CONSTANTS
   ========================================================================== */

const ROUTES = {
  homePage: '/',
  home: '/home',
  notfound: '*',
  login: '/login',
  detail: '/exams/:id/:attempt?',
  examHistory: '/exams/:id/history',
  dashboard: '/dashboard', // TODO: remove later
  myCourse: '/myCourses',
  courseDetail: '/courses/:id',
  learning: '/learning/:courseId/:lessionId?',
  permission: '/permission',
  user: '/user',
  profile: '/settings/profile',
  userDashboard: '/dashboard/enrollment_dashboard',
  lession: '/lesson',
  addLession: '/lesson/add',
  editLession: '/lesson/edit/:id',
  signup: '/signup',
  forgotpassword: '/forgot-password',
  // course
  course: '/course',
  addCourse: '/course/addcourse',
  editCoursePage: '/course/editcourse/:id',
  // categorycourse
  categoryCourse: '/categoryCourse',
  categorylession: '/categorylession',
  questionManagement: '/question-bank',
  banner: '/banner',
  examManagement: '/exam-management',
  examEdit: '/exam-management/edit/:id',
  examAdd: '/exam-management/add',
  group_exam_list: '/group_exam_list',
  group_exam_detail: '/group_exam_detail/:id',
  exam_result: '/exam_result',
  comment_question: '/exam/:examId/question/:questionId',
  progressDashboard: '/progress-dashboard',
  groupManagement: '/group-management'
}

export default ROUTES
