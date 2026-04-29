const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const router = express.Router()

router.get('/', isAuthenticated, async (_, res) => {
  try {
    const questions = await models.Question.findAll()
    const exams = await models.Exam.findAll()
    const examsQuestions = await models.ExamQuestion.findAll()

    res.json({ questions, exams, examsQuestions })
  } catch (error) {
    res.json(error)
  }
})

router.post('/create', isAuthenticated, async (req, res) => {
  try {
    await models.ExamQuestion.destroy({
      where: {
        examId: req.body.data.examId
      }
    })
    const data = req.body.data.questionIds?.map((questionId) => ({
      examId: req.body.data.examId,
      questionId
    }))
    const response = await models.ExamQuestion.bulkCreate(data)
    res.json(response)
  } catch (error) {
    res.json(error)
  }
})
/**
 * Get all users' completed courses with pagination.
 *
 * @author Canh
 * @route GET /allUsersCoursesDone
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @returns {Promise<Object>} The response object containing the paginated list of users' completed courses.
 */
router.get('/allUsersCoursesDone', isAuthenticated, async (req, res) => {
  try {
    // Extract pagination parameters from request query
    const {
      page = '1',
      size = '8'
    } = req.query

    // Fetch necessary data by optimizing queries
    const [allCourses, allUsers, allEnrollments, categoryCourse, enrollmentCounts, lessonCounts] = await Promise.all([
      models.Course.findAll(),
      models.User.findAll(),
      models.Enrollment.findAll(),
      getCourseCategory(),
      models.Enrollment.count({ group: ['courseId'] }),
      fetchLessonCounts()
    ])

    // Group enrollments by user
    const enrollmentsByUser = allEnrollments.reduce((acc, enrollment) => {
      (acc[enrollment.userId] = acc[enrollment.userId] || []).push(enrollment)
      return acc
    }, {})

    // Prepare data for each user
    const userData = allUsers.map(user => {
      const userEnrollments = enrollmentsByUser[user.id] || []
      const userCourses = allCourses.filter(course =>
        userEnrollments.some(enrollment => enrollment.courseId === course.id)
      )

      const enrollmentCountsObject = arrayToObject(enrollmentCounts, 'courseId', 'count')
      const lessonCountsObject = arrayToObject(lessonCounts, 'courseId', 'count')

      const courseProgressCountsObject = fetchCourseProgressCounts(userEnrollments)

      // Transform and filter data for this user
      return transformCourseDataDone(userCourses, [user], categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)
    })

    // Flatten the userData array if necessary or apply further transformations
    const flattenedUserData = userData.flat()
    // Apply pagination here if necessary
    const dataOfCurrentWindow = paginateData(flattenedUserData, size, page)
    // Send the response with the paginated data
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: flattenedUserData.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.log(error)
    res.status(500).json({ message: 'Đã xảy ra lỗi khi lấy danh sách khóa học theo người dùng.' })
  }
})
/**
 * Verifies the refresh token.
 *
 * @author Canh
 * @param {Array<Object>} enrollments - The list of enrollments to fetch progress counts for.
 * @returns {Promise<Object>} An object where each key is a course ID and the value is an object containing the count of progress entries and the last update timestamp.
 */
async function fetchCourseProgressCounts (enrollments) {
  // Fetch progress counts and last update timestamps for each enrollment
  const progressCounts = await Promise.all(enrollments.map(async (enroll) => {
    // Count the number of course progress entries for the enrollment
    const count = await models.CourseProgress.count({ where: { enrollmentId: enroll.id } })
    // Find the most recent course progress entry for the enrollment
    const lastUpdate = await models.CourseProgress.findOne({
      where: { enrollmentId: enroll.id },
      order: [['updatedAt', 'DESC']]
    })
    // Return an object containing the course ID, count, and last update timestamp

    return { courseId: enroll.courseId, count, lastUpdate: lastUpdate?.dataValues?.updatedAt }
  }))
  // Reduce the progressCounts array into an object keyed by course ID
  return progressCounts.reduce((obj, item) => {
    obj[item.courseId] = { count: item.count, lastUpdate: item.lastUpdate }
    return obj
  }, {})
}
/**
 * Transform course data for completed courses.
 *
 * @author Canh
 * @param {Array<Object>} courses - The list of courses to transform.
 * @param {Array<Object>} users - The list of users to match with courses.
 * @param {Array<Object>} categories - The list of categories to match with courses.
 * @param {Object} enrollmentCounts - An object containing enrollment counts keyed by course ID.
 * @param {Object} lessonCounts - An object containing lesson counts keyed by course ID.
 * @param {Object} progressCounts - An object containing progress counts and last update timestamps keyed by course ID.
 * @returns {Array<Object>} The transformed list of completed courses with additional information.
 */
function transformCourseDataDone (courses, users, categories, enrollmentCounts, lessonCounts, progressCounts) {
  return courses.map((course) => {
    // Get the total number of lessons for the course
    const lessonCount = lessonCounts[course.id] || 0
    // Get the progress data for the course
    const progressData = progressCounts[course.id] || {}
    const doneCount = progressData.count || 0
    const lastUpdate = progressData.lastUpdate || null
    // Determine if the course is completed
    const status = doneCount === lessonCount
    // If the course is completed, transform the course data
    return status
      ? {
          id: course.id,
          name: course.name,
          summary: course.summary,
          assignedBy: users.find((user) => user.id === course.assignedBy)?.username ?? null,
          durationInMinute: course.durationInMinute,
          startDate: course.startDate,
          endDate: course.endDate,
          description: course.description,
          price: course.price,
          prepare: course.prepare,
          locationPath: course.locationPath,
          categoryCourseName: categories.find((cat) => cat.id === course.categoryCourseId)?.name ?? null,
          enrollmentCount: enrollmentCounts[course.id] || 0,
          lessonCount,
          createdAt: course.createdAt,
          doneCount,
          status,
          lastUpdate
        }
      : null
  }).filter(Boolean)
  // Filter out courses that are not completed
}
/**
 * Paginates the given data.
 *
 * @author Canh
 * @param {Array} data - The array of data to be paginated.
 * @param {number} size - The number of items per page.
 * @param {number} page - The current page number (1-based index).
 * @returns {Array} A subset of the input data array corresponding to the specified page.
 */
function paginateData (data, size, page) {
  const pageSize = parseInt(size, 10)
  const pageIndex = parseInt(page, 10) - 1
  return data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
}
/**
 * Convert an array to an object.
 *
 * @author Canh
 * @param {Array<Object>} array - The array to be transformed.
 * @param {string} keyField - The field to be used as the key for the resulting object.
 * @param {string} valueField - The field to be used as the value for the resulting object.
 * @returns {Object} The transformed object with keys and values derived from the specified fields in the array items.
 */
function arrayToObject (array, keyField, valueField) {
  return array.reduce((obj, item) => {
    obj[item[keyField]] = item[valueField]
    return obj
  }, {})
}
/**
 * Fetch lesson counts for all courses.
 *
 * @author Canh
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of objects, each containing a course ID and the count of lessons.
 */
async function fetchLessonCounts () {
  // Retrieve all courses from the database
  const allCourses = await models.Course.findAll()
  // Fetch the count of lessons for each course
  return Promise.all(allCourses.map(async (course) => {
    // Retrieve all lesson categories for the current course, including the associated lessons
    const listLessonCategories = await models.CategoryLession.findAll({
      where: { courseId: course.id },
      include: [{ model: models.Lession, attributes: ['id'] }]
    })
    // Calculate the total number of lessons for the current course
    const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => sum + lessonCategory.Lessions.length, 0)
    // Return an object containing the course ID and the count of lessons
    return { courseId: course.id, count: lessonCount }
  }))
}
/**
 * Get all course categories.
 *
 * @author Canh
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of course category objects.
 */
async function getCourseCategory () {
  return await models.CategoryCourse.findAll({
    order: [['id', 'DESC']]
  })
}
module.exports = router
