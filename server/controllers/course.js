/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')
const currentDate = new Date()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { Op } = require('sequelize')
const CategoryCourse = require('../models/category_course')

function logError (req, error) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  errorLogger.error({
    message: `Error ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    error: error.message,
    user: req.user.id
  })
}

function logInfo (req, response) {
  const request = req.body.data ? req.body.data : (req.params ? req.params : req.query)
  infoLogger.info({
    message: `Accessed ${req.path}`,
    method: req.method,
    endpoint: req.path,
    request,
    response,
    user: req.user.id
  })
}
/**
 * Get recently enrolled courses by user ID with pagination.
 *
 * @author Canh
 * @route GET /recentlyEnrolledByUserID
 * @param {string} req.query.userId - The ID of the user to retrieve enrollments for.
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 2).
 * @returns {Promise<Object>} The response object containing paginated courses data.
 */
router.get('/recentlyEnrolledByUserID', async (req, res) => {
  try {
    // FIX: moved userId from req.body.data to req.query (GET requests should not rely on body)
    const { userId, page = '1', size = '2' } = req.query
    // Retrieve all enrollments for the specified user
    const enrollments = await models.Enrollment.findAll({
      where: {
        userId
      }
    })
    // Retrieve courses for each enrollment
    const courses = []
    for (const enrollment of enrollments) {
      const course = await models.Course.findByPk(enrollment.courseId)
      courses.push(course)
    }
    // Paginate the courses data
    const dataOfCurrentWindow = paginateData(courses, size, page)
    // Send the response with paginated courses data
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: courses.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error(error)
    res.status(500).send('Internal Server Error')
  }
})
/**
 * Get completed courses by user ID.
 *
 * @author Canh
 * @route GET /courseDoneByUser
 * @param {string} req.query.userId - The ID of the user to retrieve completed courses for.
 * @returns {Promise<Object>} The response object containing the list of completed courses and additional information.
 */
router.get('/courseDoneByUser', async (req, res) => {
  try {
    // Extract userId from request query
    const { userId } = req.query
    // Fetch necessary data by optimizing queries
    const [allCourses, allUsers, enrollments, categoryCourse, enrollmentCounts, lessonCounts] = await Promise.all([
      models.Course.findAll(),
      models.User.findAll(),
      getEnrollmentByUserId(userId),
      getCourseCategory(),
      models.Enrollment.count({ group: ['courseId'] }),
      fetchLessonCounts()
    ])
    // Filter courses to include only those that the user is enrolled in
    const filteredCourses = allCourses.filter(course =>
      enrollments.some(enrollment => enrollment.courseId === course.id)
    )
    // Convert enrollment counts and lesson counts to objects for easier access
    const enrollmentCountsObject = arrayToObject(enrollmentCounts, 'courseId', 'count')
    const lessonCountsObject = arrayToObject(lessonCounts, 'courseId', 'count')
    // Retrieve enrollments for the user and the filtered courses
    const userEnrollments = await models.Enrollment.findAll({
      where: {
        userId,
        courseId: filteredCourses.map(course => course.id)
      }
    })
    // Fetch course progress counts for the user's enrollments
    const courseProgressCountsObject = await fetchCourseProgressCounts(userEnrollments)
    // Transform the course data to include additional information
    const dataFromDatabase = transformCourseDataDone(filteredCourses, allUsers, categoryCourse, enrollmentCountsObject, lessonCountsObject, courseProgressCountsObject)
    // Log the retrieved data for debugging purposes
    logInfo(req, dataFromDatabase)
    // Send the response with the retrieved data
    res.json({
      userId,
      totalRecords: dataFromDatabase.length,
      data: dataFromDatabase
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    console.log(error)
    res.status(500).json({ message: 'Internal Server ER' })
  }
})
/**
 * Get active courses for the authenticated user with pagination and filtering.
 *
 * @author Canh
 * @route GET /myCoursesActive
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @param {string} [req.query.search] - The search term for filtering courses by name.
 * @param {string} [req.query.startDate] - The start date for filtering courses (default is 1970-01-01).
 * @param {string} [req.query.endDate] - The end date for filtering courses (default is 9999-12-31).
 * @param {string} [req.query.category] - The category name for filtering courses.
 * @returns {Promise<Object>} The response object containing paginated and filtered list of active courses.
 */
router.get('/myCoursesActive', isAuthenticated, async (req, res) => {
  try {
    // Extract userId from request
    const loginedUserId = req.user.id
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query
    // Extract pagination parameters from request query
    const limit = parseInt(size)
    const offset = (parseInt(page) - 1) * limit
    // Retrieve enrollments for the authenticated user and filter for active courses
    let myCourses = await getEnrollmentByUserId(loginedUserId)
    myCourses = myCourses.filter(course => course.status === false)
    const listUsers = await models.User.findAll()
    const enrichedCourses = []
    for (const course of myCourses) {
      // Retrieve course details
      const courseDetail = await models.Course.findOne({
        where: { id: course.courseId },
        attributes: ['name', 'categoryCourseId', 'startDate', 'endDate', 'locationPath', 'durationInMinute', 'assignedBy']
      })
      // Retrieve category details
      const categoryCourseDetail = await models.CategoryCourse.findOne({
        where: { id: courseDetail.categoryCourseId },
        attributes: ['name']
      })
      // Retrieve the last update of the course progress
      const lastUpdate = await models.CourseProgress.findOne({
        where: { enrollmentId: course.id },
        order: [['updatedAt', 'DESC']]
      })
      // Enrich course data with additional details
      enrichedCourses.push({
        ...course.dataValues,
        name: courseDetail.name,
        categoryCourseName: categoryCourseDetail.name,
        startDate: courseDetail.startDate,
        endDate: courseDetail.endDate,
        locationPath: courseDetail.locationPath,
        durationInMinute: courseDetail.durationInMinute,
        lastUpdate: lastUpdate ? lastUpdate.updatedAt : null,
        progress: course.progress,
        assignedBy: listUsers?.find((e) => courseDetail.assignedBy === e.id)?.username ?? null,
        creatorAVT: listUsers?.find((e) => courseDetail.assignedBy === e.id)?.avatar ?? null
      })
    }
    const s = startDate ? new Date(startDate) : null; if (s) s.setHours(0, 0, 0, 0)
    const e = endDate ? new Date(endDate) : null; if (e) e.setHours(23, 59, 59, 999)

    const filteredCourses = enrichedCourses.filter(course => {
      const matchesSearch = searchCondition ? course.name.toLowerCase().includes(searchCondition.toLowerCase()) : true
      const matchesCategory = categoryCondition ? course.categoryCourseName.toLowerCase().includes(categoryCondition.toLowerCase()) : true
      const sd = new Date(course.startDate); sd.setHours(0, 0, 0, 0)
      const matchesStartRange = (s ? sd >= s : true) && (e ? sd <= e : true)
      return matchesSearch && matchesCategory && matchesStartRange
    })
    // Paginate data using offset and limit
    const paginatedCourses = filteredCourses.slice(offset, offset + limit)
    // Send the response with paginated and filtered courses data
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: filteredCourses.length,
      data: paginatedCourses
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error(error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})
/**
 * Get completed courses for the authenticated user with pagination and filtering.
 *
 * @author Canh
 * @route GET /myCoursesDone
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @param {string} [req.query.search] - The search term for filtering courses by name.
 * @param {string} [req.query.startDate] - The start date for filtering courses (default is 1970-01-01).
 * @param {string} [req.query.endDate] - The end date for filtering courses (default is 9999-12-31).
 * @param {string} [req.query.category] - The category name for filtering courses.
 * @returns {Promise<Object>} The response object containing paginated and filtered list of completed courses.
 */
router.get('/myCoursesDone', isAuthenticated, async (req, res) => {
  try {
    // Extract userId from request
    const loginedUserId = req.user.id
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query
    // Extract pagination parameters from request query
    const limit = parseInt(size)
    const offset = (parseInt(page) - 1) * limit
    // Retrieve enrollments for the authenticated user and filter for completed courses
    let myCourses = await getEnrollmentByUserId(loginedUserId)
    myCourses = myCourses.filter(course => course.status === true)
    const listUsers = await models.User.findAll()
    const enrichedCourses = []
    for (const course of myCourses) {
      // Retrieve course details
      const courseDetail = await models.Course.findOne({
        where: { id: course.courseId },
        attributes: ['name', 'categoryCourseId', 'startDate', 'endDate', 'locationPath', 'durationInMinute', 'assignedBy']
      })
      // Retrieve category details
      const categoryCourseDetail = await models.CategoryCourse.findOne({
        where: { id: courseDetail.categoryCourseId },
        attributes: ['name']
      })
      // Retrieve the last update of the course progress
      const lastUpdate = await models.CourseProgress.findOne({
        where: { enrollmentId: course.id },
        order: [['updatedAt', 'DESC']]
      })
      // Enrich course data with additional details
      enrichedCourses.push({
        ...course.dataValues,
        name: courseDetail.name,
        categoryCourseName: categoryCourseDetail.name,
        startDate: courseDetail.startDate,
        endDate: courseDetail.endDate,
        locationPath: courseDetail.locationPath,
        durationInMinute: courseDetail.durationInMinute,
        lastUpdate: lastUpdate ? lastUpdate.updatedAt : null,
        progress: course.progress,
        assignedBy: listUsers?.find((e) => courseDetail.assignedBy === e.id)?.username ?? null,
        creatorAVT: listUsers?.find((e) => courseDetail.assignedBy === e.id)?.avatar ?? null
      })
    }
    const s = startDate ? new Date(startDate) : null; if (s) s.setHours(0, 0, 0, 0)
    const e = endDate ? new Date(endDate) : null; if (e) e.setHours(23, 59, 59, 999)

    const filteredCourses = enrichedCourses.filter(course => {
      const matchesSearch = searchCondition ? course.name.toLowerCase().includes(searchCondition.toLowerCase()) : true
      const matchesCategory = categoryCondition ? course.categoryCourseName.toLowerCase().includes(categoryCondition.toLowerCase()) : true
      const sd = new Date(course.startDate); sd.setHours(0, 0, 0, 0)
      const matchesStartRange = (s ? sd >= s : true) && (e ? sd <= e : true)
      return matchesSearch && matchesCategory && matchesStartRange
    })
    // Paginate data using offset and limit
    const paginatedCourses = filteredCourses.slice(offset, offset + limit)
    // Send the response with paginated and filtered courses data
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: filteredCourses.length,
      data: paginatedCourses
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error(error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})
/**
 * Get all courses for the authenticated user with pagination and filtering.
 *
 * @author Canh
 * @route GET /myCourses
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @param {string} [req.query.search] - The search term for filtering courses by name.
 * @param {string} [req.query.startDate] - The start date for filtering courses (default is 1970-01-01).
 * @param {string} [req.query.endDate] - The end date for filtering courses (default is 9999-12-31).
 * @param {string} [req.query.category] - The category name for filtering courses.
 * @returns {Promise<Object>} The response object containing paginated and filtered list of courses.
 */
router.get('/myCourses', isAuthenticated, async (req, res) => {
  try {
    // Extract userId from request
    const loginedUserId = req.user.id
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query
    // Extract pagination parameters from request query
    const limit = parseInt(size)
    const offset = (parseInt(page) - 1) * limit
    // Retrieve enrollments for the authenticated user
    const myCourses = await getEnrollmentByUserId(loginedUserId)
    const listUsers = await models.User.findAll()
    const enrichedCourses = []
    for (const course of myCourses) {
      // Retrieve course details
      const courseDetail = await models.Course.findOne({
        where: { id: course.courseId },
        attributes: ['name', 'categoryCourseId', 'startDate', 'endDate', 'locationPath', 'durationInMinute', 'assignedBy']
      })
      // Retrieve category details
      const categoryCourseDetail = await models.CategoryCourse.findOne({
        where: { id: courseDetail.categoryCourseId },
        attributes: ['name']
      })
      // Retrieve the last update of the course progress
      const lastUpdate = await models.CourseProgress.findOne({
        where: { enrollmentId: course.id },
        order: [['updatedAt', 'DESC']]
      })
      // Enrich course data with additional details
      enrichedCourses.push({
        ...course.dataValues,
        name: courseDetail.name,
        categoryCourseName: categoryCourseDetail.name,
        startDate: courseDetail.startDate,
        endDate: courseDetail.endDate,
        locationPath: courseDetail.locationPath,
        durationInMinute: courseDetail.durationInMinute,
        lastUpdate: lastUpdate ? lastUpdate.updatedAt : null,
        assignedBy: listUsers?.find((e) => courseDetail.assignedBy === e.id)?.username ?? null,
        creatorAVT: listUsers?.find((e) => courseDetail.assignedBy === e.id)?.avatar ?? null
      })
    }
    // Apply search and filter conditions
    const s = startDate ? new Date(startDate) : null; if (s) s.setHours(0, 0, 0, 0)
    const e = endDate ? new Date(endDate) : null; if (e) e.setHours(23, 59, 59, 999)

    const filteredCourses = enrichedCourses.filter(course => {
      const matchesSearch = searchCondition ? course.name.toLowerCase().includes(searchCondition.toLowerCase()) : true
      const matchesCategory = categoryCondition ? course.categoryCourseName.toLowerCase().includes(categoryCondition.toLowerCase()) : true
      const sd = new Date(course.startDate); sd.setHours(0, 0, 0, 0)
      const matchesStartRange = (s ? sd >= s : true) && (e ? sd <= e : true)
      return matchesSearch && matchesCategory && matchesStartRange
    })
    // Calculate total records and paginate data using offset and limit
    const totalRecords = filteredCourses.length
    const paginatedCourses = filteredCourses.slice(offset, offset + limit)
    // Send the response with paginated and filtered courses data
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: paginatedCourses
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.error(error)
    res.status(500).json({ error: 'Đã xảy ra lỗi khi lấy danh sách khóa học.' })
  }
})
/**
 * Get all courses.
 *
 * @author Canh
 * @route GET /getAllCourse
 * @returns {Promise<Object>} The response object containing the list of courses.
 */
router.get('/getAllCourse', isAuthenticated, async (req, res) => {
  try {
    // Retrieve all courses from the database with specified attributes
    const courses = await models.Course.findAll({
      attributes: ['id', 'name']
    })
    // Log the retrieved courses for debugging purposes
    logInfo(req, courses)
    // Send the response with the list of courses
    res.json(courses)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

/**
 * Converts an array to an object.
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
 * Fetch course progress counts for a list of enrollments.
 *
 * @author Canh
 * @param {Array<Object>} enrollments - The list of enrollments to fetch progress counts for.
 * @returns {Promise<Object>} An object where each key is a course ID and the value is an object
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
 * Paginate the given data.
 *
 * @author Canh
 * @param {Array} data - The array of data to be paginated.
 * @param {string|number} size - The number of items per page.
 * @param {string|number} page - The current page number (1-based index).
 * @returns {Array} A subset of the input data array corresponding to the specified page.
 */
function paginateData (data, size, page) {
  const pageSize = parseInt(size, 10)
  const pageIndex = parseInt(page, 10) - 1
  return data.slice(pageIndex * pageSize, (pageIndex + 1) * pageSize)
}

/**
 * Get new courses with pagination.
 *
 * @author Canh
 * @route GET /getNewCourse
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 4).
 * @returns {Promise<Object>} The response object containing paginated list of new courses.
 */
router.get('/getNewCourse', isAuthenticated, async (req, res) => {
  try {
    const {
      page = '1',
      size = '4'
    } = req.query
    const limit = parseInt(size)
    const offset = (parseInt(page) - 1) * limit

    // Build where condition for publicStatus and publicDate
    // publicStatus = 0: Draft - Không hiển thị
    // publicStatus = 1: Hẹn giờ - Kiểm tra publicDate
    // publicStatus = 2: Công khai ngay - Hiển thị luôn
    const now = new Date()
    const whereCondition = {
      [Op.or]: [
        { publicStatus: 2 }, // Công khai ngay
        {
          publicStatus: 1,
          publicDate: { [Op.lte]: now } // Hẹn giờ và đã đến thời gian
        }
      ]
    }

    // Retrieve the latest courses with pagination and filter
    const listCourses = await models.Course.findAll({
      where: whereCondition,
      offset,
      limit,
      order: [['createdAt', 'DESC']]
    })
    // Retrieve all users
    const listUsers = await models.User.findAll()
    // Retrieve all course categories
    const categoryCourse = await getCourseCategory()
    // Retrieve enrollment counts grouped by course ID

    const enrollmentCounts = await models.Enrollment.count({
      group: ['courseId']
    })
    // Convert enrollment counts to an object for easier access
    const enrollmentCountsObject = enrollmentCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    // Retrieve lesson counts for each course
    const lessonCounts = await Promise.all(listCourses.map(async (course) => {
      const listLessonCategories = await models.CategoryLession.findAll({
        where: { courseId: course.id },
        include: [{
          model: models.Lession,
          attributes: ['id']
        }]
      })

      const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => {
        return sum + lessonCategory.Lessions.length
      }, 0)

      return { courseId: course.id, count: lessonCount }
    }))
    // Convert lesson counts to an object for easier access
    const lessonCountsObject = lessonCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    // Transform the course data to include additional information
    const dataFromDatabase = listCourses.map((course) => ({
      id: course.id,
      name: course.name,
      summary: course.summary,
      assignedBy: listUsers?.find((e) => course.assignedBy === e.id)?.username ?? null,
      durationInMinute: course.durationInMinute,
      startDate: course.startDate,
      endDate: course.endDate,
      description: course.description,
      price: course.price,
      prepare: course.prepare,
      locationPath: course.locationPath,
      categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
      enrollmentCount: enrollmentCountsObject[course.id] || 0,
      lessonCount: lessonCountsObject[course.id] || 0,
      createdAt: course.createdAt,
      publicStatus: course.publicStatus,
      publicDate: course.publicDate
    }))
    // Log the access to the route
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.query,
      response: dataFromDatabase,
      user: req.user.id
    })
    // Retrieve the total number of courses in the database with same filter
    const totalRecords = await models.Course.count({ where: whereCondition })
    // Send the response with paginated and transformed course data
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: dataFromDatabase
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.log(error)
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get courses with pagination and filtering.
 *
 * @author Canh
 * @route GET /
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @param {string} [req.query.search] - The search term for filtering courses by name.
 * @param {string} [req.query.startDate] - The start date for filtering courses (default is 1970-01-01).
 * @param {string} [req.query.endDate] - The end date for filtering courses (default is 9999-12-31).
 * @param {string} [req.query.category] - The category name for filtering courses.
 * @returns {Promise<Object>} The response object containing paginated and filtered list of courses.
 */
router.get('/', isAuthenticated, async (req, res) => {
  try {
    // Extract query parameters from the request
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-30', // FIX: '9999-12-31' overflows MySQL DATETIME when converted to UTC+7 → '10000-01-01'
      category: categoryCondition
    } = req.query
    const offset = (Number(page) - 1) * Number(size)

    // Add publicStatus and publicDate filter
    // publicStatus = 0: Draft - Không hiển thị
    // publicStatus = 1: Hẹn giờ - Kiểm tra publicDate
    // publicStatus = 2: Công khai ngay - Hiển thị luôn
    const now = new Date()

    // FIX: wrap all conditions inside Op.and to avoid Sequelize conflicts
    // when Op.or, name, startDate and categoryCourseId are all set on the
    // same where object simultaneously (causes malformed SQL / 500 error).
    const andConditions = [
      {
        [Op.or]: [
          { publicStatus: 2 }, // Công khai ngay
          {
            publicStatus: 1,
            publicDate: { [Op.lte]: now } // Hẹn giờ và đã đến thời gian
          }
        ]
      }
    ]

    if (searchCondition) {
      andConditions.push({ name: { [Op.like]: `%${searchCondition}%` } })
    }
    if (startDate || endDate) {
      const s = startDate ? new Date(startDate) : null
      if (s) s.setHours(0, 0, 0, 0)
      let e = endDate ? new Date(endDate) : null
      if (e) {
        // FIX: clamp endDate to MySQL DATETIME max to prevent overflow.
        // Frontend sends '9999-12-31T00:00:00.000Z'; after timezone conversion
        // (+7h) this becomes '10000-01-01 06:59:59' which MySQL rejects.
        const mysqlMaxDate = new Date('9999-12-31T16:59:59.000Z') // 9999-12-31 23:59:59 UTC+7
        if (e > mysqlMaxDate) e = mysqlMaxDate
        else e.setHours(23, 59, 59, 999)
      }
      // Chỉ so theo course.startDate trong [s, e]
      andConditions.push({
        startDate: {
          ...(s ? { [Op.gte]: s } : {}),
          ...(e ? { [Op.lte]: e } : {})
        }
      })
    }
    if (categoryCondition && categoryCondition !== 'all') {
      andConditions.push({ categoryCourseId: categoryCondition })
    }

    const searchConditions = {
      where: { [Op.and]: andConditions }
    }
    // Fetch the total count of courses with filtering conditions
    const totalRecords = await models.Course.count(searchConditions)
    // Fetch the courses with limit and offset
    const listCourses = await models.Course.findAll({
      ...searchConditions,
      limit: Number(size),
      offset
    })
    // Fetch additional data required for response
    const listUsers = await models.User.findAll()
    const categoryCourse = await getCourseCategory()
    const enrollmentCounts = await models.Enrollment.count({
      group: ['courseId']
    })
    // Convert enrollment counts to an object for easier access
    const enrollmentCountsObject = enrollmentCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    // Fetch lesson counts for each course
    const lessonCounts = await Promise.all(listCourses.map(async (course) => {
      const listLessonCategories = await models.CategoryLession.findAll({
        where: { courseId: course.id },
        include: [{
          model: models.Lession,
          attributes: ['id']
        }]
      })
      const lessonCount = listLessonCategories.reduce((sum, lessonCategory) => {
        return sum + lessonCategory.Lessions.length
      }, 0)
      return { courseId: course.id, count: lessonCount }
    }))
    // Convert lesson counts to an object for easier access
    const lessonCountsObject = lessonCounts.reduce((obj, count) => {
      obj[count.courseId] = count.count
      return obj
    }, {})
    // Transform the course data to include additional information
    const dataFromDatabase = listCourses.map((course) => ({
      id: course.id,
      name: course.name,
      summary: course.summary,
      assignedBy: listUsers?.find((e) => course.assignedBy === e.id)?.username ?? null,
      creatorAVT: listUsers?.find((e) => course.assignedBy === e.id)?.avatar ?? null,
      durationInMinute: course.durationInMinute,
      startDate: course.startDate,
      endDate: course.endDate,
      description: course.description,
      price: course.price,
      prepare: course.prepare,
      locationPath: course.locationPath,
      categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
      enrollmentCount: enrollmentCountsObject[course.id] || 0,
      lessonCount: lessonCountsObject[course.id] || 0,
      createdAt: course.createdAt,
      publicStatus: course.publicStatus,
      publicDate: course.publicDate
    }))
      .sort((a, b) => {
        if (b.enrollmentCount - a.enrollmentCount !== 0) {
          return b.enrollmentCount - a.enrollmentCount
        } else {
          return new Date(b.createdAt) - new Date(a.createdAt)
        }
      })
    // FIX: removed redundant in-memory applyNameSearch / applyDateRangeSearch passes
    // because filtering is already applied at the DB query level above.
    // Only applyCourseCategoryNameSearch is kept as a safety net (categoryCondition
    // is already handled via categoryCourseId in the DB WHERE clause, but kept for
    // backward-compat with the existing response shape).
    const dataAfterSearch = await applyCourseCategoryNameSearch(categoryCondition, dataFromDatabase)

    // infoLogger.info({
    //   message: `Accessed ${req.path}`,
    //   method: req.method,
    //   endpoint: req.path,
    //   request: req.query,
    //   response: dataAfterSearch,
    //   user: req.user.id
    // })
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords,
      data: dataAfterSearch
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.log(error)
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get paid courses with pagination and filtering.
 *
 * @author Canh
 * @route GET /paidCourse
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @param {string} [req.query.search] - The search term for filtering courses by name.
 * @param {string} [req.query.startDate] - The start date for filtering courses (default is 1970-01-01).
 * @param {string} [req.query.endDate] - The end date for filtering courses (default is 9999-12-31).
 * @param {string} [req.query.category] - The category name for filtering courses.
 * @returns {Promise<Object>} The response object containing paginated and filtered list of paid courses.
 */
router.get('/paidCourse', isAuthenticated, async (req, res) => {
  try {
    // Extract query parameters from the request
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query
    // Retrieve all courses and users from the database
    const listCourses = await models.Course.findAll()
    const listUsers = await models.User.findAll()
    const categoryCourse = await getCourseCategory()
    // Filter and map the courses to include only paid courses with additional information
    const dataFromDatabase = await listCourses
      ?.filter(course => course.price > 0)
      .map((course) => ({
        id: course.id,
        name: course.name,
        summary: course.summary,
        assignedBy: listUsers?.find((e) => course.assignedBy === e.id)?.username ?? null,
        durationInMinute: course.durationInMinute,
        startDate: course.startDate,
        endDate: course.endDate,
        description: course.description,
        price: course.price,
        prepare: course.prepare,
        locationPath: course.locationPath,
        categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
        publicStatus: course.publicStatus,
        publicDate: course.publicDate
      }))
    // Apply search and filter conditions
    const dataAfterNameSearch = applyNameSearch(
      searchCondition,
      dataFromDatabase
    )
    const dataAfterNameAndDateSearch = applyDateRangeSearch(
      startDate,
      endDate,
      dataAfterNameSearch
    )
    // FIX: await the now-async applyCourseCategoryNameSearch
    const dataAfterSearch = await applyCourseCategoryNameSearch(
      categoryCondition,
      dataAfterNameAndDateSearch
    )
    // Paginate the filtered data
    const dataOfCurrentWindow = getDataInWindowSize(
      size,
      page,
      dataAfterSearch
    )
    // Send the response with paginated and filtered courses data
    // infoLogger.info({
    //   message: `Accessed ${req.path}`,
    //   method: req.method,
    //   endpoint: req.path,
    //   request: req.query,
    //   response: dataOfCurrentWindow,
    //   user: req.user.id
    // })
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.log(error)
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get free courses with pagination and filtering.
 *
 * @author Canh
 * @route GET /freeCourse
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 8).
 * @param {string} [req.query.search] - The search term for filtering courses by name.
 * @param {string} [req.query.startDate] - The start date for filtering courses (default is 1970-01-01).
 * @param {string} [req.query.endDate] - The end date for filtering courses (default is 9999-12-31).
 * @param {string} [req.query.category] - The category name for filtering courses.
 * @returns {Promise<Object>} The response object containing paginated and filtered list of free courses.
 */
router.get('/freeCourse', isAuthenticated, async (req, res) => {
  try {
    // Extract query parameters from the request
    const {
      page = '1',
      size = '8',
      search: searchCondition,
      startDate = '1970-01-01',
      endDate = '9999-12-31',
      category: categoryCondition
    } = req.query
    // Retrieve all courses and users from the database
    const listCourses = await models.Course.findAll()
    const listUsers = await models.User.findAll()
    const categoryCourse = await getCourseCategory()
    // Filter and map the courses to include only free courses with additional information
    const dataFromDatabase = await listCourses
      ?.filter(course => Number(course.price) === 0)
      .map((course) => ({
        id: course.id,
        name: course.name,
        summary: course.summary,
        assignedBy: listUsers?.find((e) => course.assignedBy === e.id)?.username ?? null,
        durationInMinute: course.durationInMinute,
        startDate: course.startDate,
        endDate: course.endDate,
        description: course.description,
        price: course.price,
        prepare: course.prepare,
        locationPath: course.locationPath,
        categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
        publicStatus: course.publicStatus,
        publicDate: course.publicDate
      }))
    // Apply search and filter conditions
    const dataAfterNameSearch = applyNameSearch(
      searchCondition,
      dataFromDatabase
    )
    const dataAfterNameAndDateSearch = applyDateRangeSearch(
      startDate,
      endDate,
      dataAfterNameSearch
    )
    // FIX: await the now-async applyCourseCategoryNameSearch
    const dataAfterSearch = await applyCourseCategoryNameSearch(
      categoryCondition,
      dataAfterNameAndDateSearch
    )
    // Paginate the filtered data
    const dataOfCurrentWindow = getDataInWindowSize(
      size,
      page,
      dataAfterSearch
    )
    // Send the response with paginated and filtered courses data
    // infoLogger.info({
    //   message: `Accessed ${req.path}`,
    //   method: req.method,
    //   endpoint: req.path,
    //   request: req.query,
    //   response: dataOfCurrentWindow,
    //   user: req.user.id
    // })
    res.json({
      page: Number(page),
      size: Number(size),
      totalRecords: dataAfterSearch.length,
      data: dataOfCurrentWindow
    })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    console.log(error)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Apply date range filter to the input data.
 *
 * @author Canh
 * @param {string} startDate - The start date for filtering (inclusive).
 * @param {string} endDate - The end date for filtering (inclusive).
 * @param {Array<Object>} inputData - The array of data to be filtered.
 * @returns {Array<Object>} The filtered array of data that falls within the specified date range.
 */
function applyDateRangeSearch (startDate, endDate, inputData) {
  if (!startDate && !endDate) return inputData
  const s = startDate ? new Date(startDate) : null; if (s) s.setHours(0, 0, 0, 0)
  const e = endDate ? new Date(endDate) : null; if (e) e.setHours(23, 59, 59, 999)
  return inputData.filter(d => {
    const sd = new Date(d.startDate)
    return (s ? sd >= s : true) && (e ? sd <= e : true)
  })
}
/**
 * Get course progress for a specific course and user.
 *
 * @author Canh
 * @route GET /course-progress
 * @param {string} req.body.userId - The ID of the user to retrieve progress for.
 * @param {string} req.body.courseId - The ID of the course to retrieve progress for.
 * @returns {Promise<Object>} The response object containing the course progress data.
 */
router.get('/course-progress', isAuthenticated, async (req, res) => {
  try {
    // Extract course ID and user ID from the request body
    const { courseId, userId } = req.body
    if (!courseId || !userId) {
      console.log('Missing courseId or userId')
      return res.status(500).json({ message: jsonError })
    }
    // Retrieve course progress data for the specified course and user
    const courseProgress = await getCourseProgress(courseId, userId)
    // Log the access to the route
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.body,
      response: courseProgress,
      user: req.user.id
    })
    // Send the response with the course progress data
    res.json(courseProgress)
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    console.log(error)
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get all course categories.
 *
 * @author Canh
 * @route GET /course-category
 * @returns {Promise<Object>} The response object containing the list of course categories.
 */
router.get('/course-category', isAuthenticated, async (req, res) => {
  try {
    // Retrieve all course categories from the database
    const courseCategory = await getCourseCategory()
    // Log the access to the route
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.query,
      response: courseCategory,
      user: req.user.id
    })
    // Send the response with the list of course categories
    res.json(courseCategory)
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    console.log(error)
    res.status(500).json({ message: jsonError })
  }
})

router.get('/list', isAuthenticated, async (req, res) => {
  try {
    const courses = await models.Course.findAll({
      attributes: ['id', 'name']
    })
    res.json({ data: courses })
  } catch (err) {
    console.error(err)
    res.status(500).json({ message: 'Internal server error' })
  }
})
/**
 * Get course details by ID.
 *
 * @author Canh
 * @route GET /:id
 * @param {string} req.params.id - The ID of the course to retrieve.
 * @returns {Promise<Object>} The response object containing the course details and category name.
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params

    // Retrieve the course by its ID
    const course = await models.Course.findByPk(id)

    // If the course is not found, return a 404 error
    if (!course) {
      return res.status(404).json({ message: 'Course not found' })
    }

    // Retrieve all course categories
    const categoryCourse = await getCourseCategory()

    // Check if course has exam with publicStatus = 1
    const exam = await models.Exam.findOne({
      where: {
        courseId: id,
        publicStatus: 1
      }
    })

    // Construct the response object with course details, category name, and exam status
    const response = {
      ...course.toJSON(),
      categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null,
      exam: exam || null // Include exam details if exists, otherwise null
    }

    // Log the access to the route
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.params,
      response: course,
      user: req.user.id
    })

    // Send the response with the course details
    res.json(response)
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    res.status(500).json({ message: 'Failed to fetch course', error: error.message })
  }
})

/**
 * Retrieves all courses for exam selection.
 * Marks courses as disabled if they already have an associated exam.
 *
 * @author Hien
 * @route GET /getAllCourseForExamSelect
 * @returns {Promise<Object>} A JSON array of courses with a disabled flag.
 * @throws {Error} If an error occurs during retrieval.
 */
router.get('/exam/getAllCourseForExamSelect', isAuthenticated, async (req, res) => {
  try {
    // TODO: Fetch exam records that have a non-null courseId.
    const examCourses = await models.Exam.findAll({
      attributes: ['courseId'],
      where: { courseId: { [Op.ne]: null } },
      raw: true
    })
    // TODO: Extract course IDs from the fetched exam records.
    const examCourseIds = examCourses.map(item => item.courseId)

    // TODO: Retrieve all courses with id and name attributes.
    const courses = await models.Course.findAll({
      attributes: ['id', 'name']
    })

    // TODO: Mark courses as disabled if their id exists in the examCourseIds array.
    const modifiedCourses = courses.map(course => ({
      id: course.id,
      name: course.name,
      disabled: examCourseIds.includes(course.id)
    }))

    res.json(modifiedCourses)
  } catch (err) {
    logError(req, err)
    console.error(err)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
/**
 * Get course progress for a specific course and user.
 *
 * @author Canh
 * @param {string} courseId - The ID of the course to retrieve progress for.
 * @param {string} userId - The ID of the user to retrieve progress for.
 * @returns {Promise<Array<Object>>} The response object containing the course progress data.
 */
async function getCourseProgress (courseId, userId) {
  return await models.MyCourses.findAll({
    where: {
      courseId,
      userId
    }
  })
}
/**
 * Apply name search filter to the input data.
 *
 * This function filters the input data array to include only the items whose name contains the specified search term.
 * The search is case-insensitive.
 *
 * @author Canh
 * @param {string} searchCondition - The search term for filtering data by name.
 * @param {Array<Object>} data - The array of data to be filtered.
 * @returns {Array<Object>} The filtered array of data that matches the search term.
 */
function applyNameSearch (searchCondition, data) {
  if (searchCondition) {
    data = data.filter(
      (d) => d.name?.toLowerCase()?.indexOf(searchCondition.toLowerCase()) >= 0
    )
  }
  return data
}
/**
 * Apply course category name search filter to the input data.
 *
 * This function filters the input data array to include only the items whose category name matches the specified category ID.
 * If the category ID is 'all' or not provided, it returns the original data.
 *
 * @author Canh
 * @param {string} categoryID - The ID of the category to filter by.
 * @param {Array<Object>} data - The array of data to be filtered.
 * @returns {Promise<Array<Object>>} The filtered array of data that matches the category name.
 */
// FIX: converted to async and added await on CategoryCourse.findByPk()
// Previously this returned a Promise object (always truthy) instead of the actual record,
// causing category.name to be undefined and the filter to silently return wrong results.
async function applyCourseCategoryNameSearch (categoryID, data) {
  if (categoryID === 'all' || !categoryID) {
    return data
  } else {
    const category = await CategoryCourse.findByPk(categoryID) // FIX: added await
    const categoryName = category ? category.name : ''

    if (categoryName) {
      data = data.filter(
        (d) => d.categoryCourseName?.toLowerCase()?.indexOf(categoryName.toLowerCase()) >= 0
      )
    }
    return data
  }
}
/**
 * Paginate the input data based on the specified page size and page number.
 *
 * This function slices the input data array to return a subset of the data based on the specified page size and page number.
 * If the size or page parameters are not valid numbers, it returns the original data.
 *
 * @author Canh
 * @param {string|number} size - The number of items per page.
 * @param {string|number} page - The current page number (1-based index).
 * @param {Array<Object>} data - The array of data to be paginated.
 * @returns {Array<Object>} The paginated subset of the input data array.
 */
function getDataInWindowSize (size, page, data) {
  if (!isNaN(Number(size)) && !isNaN(Number(page))) {
    data = data.slice(
      Number(size) * (Number(page) - 1),
      Number(size) * Number(page)
    )
  }
  return data
}
/**
 * Retrieve all course categories.
 *
 * This function retrieves all course categories from the database, ordered by their ID in descending order.
 *
 * @author Canh
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of course category objects.
 */
async function getCourseCategory () {
  return await models.CategoryCourse.findAll({
    order: [['id', 'DESC']]
  })
}
/**
 * Retrieve all enrollments for a specific user.
 *
 * This function retrieves all enrollments from the database for a given user ID, ordered by their ID in descending order.
 *
 * @author Canh
 * @param {number} userId - The ID of the user to retrieve enrollments for.
 * @returns {Promise<Array<Object>>} A promise that resolves to an array of enrollment objects.
 */
async function getEnrollmentByUserId (userId) {
  return await models.Enrollment.findAll({
    where: { userId },
    order: [['id', 'DESC']]
  })
}
/**
 * Fetches all courses from the database along with their associated category information.
 *
 * @author Quoc
 * @route GET /courses/all
 * @returns {Promise<Object>} A JSON object containing a list of courses and their details.
 */
router.get('/all', async (req, res) => {
  try {
    // Fetch all courses from the database, including the associated CategoryCourse
    const listCourses = await models.Course.findAll({
      include: [models.CategoryCourse], // Include the associated CategoryCourse model
      order: [['id', 'DESC']] // Order the courses by ID in descending order
    })

    // Map through the list of courses to enrich them with the author's username
    const coursePromises = listCourses.map(async (course) => {
      let username = null // Initialize username to null
      // Check if the course has an assigned user
      if (course.assignedBy) {
        // Fetch the username of the user who assigned the course
        const author = await models.User.findByPk(course.assignedBy, {
          attributes: ['username'] // Select only the username field
        })
        // If the author is found, assign their username
        if (author) {
          username = author.username
        }
      }
      // Return a new object containing the desired course details
      return {
        id: course.id,
        name: course.name,
        summary: course.summary,
        assignBy: username, // Include the author's username
        durationInMinute: course.durationInMinute,
        startDate: course.startDate,
        endDate: course.endDate,
        locationPath: course.locationPath,
        description: course.description,
        price: course.price,
        prepare: course.prepare,
        categoryCoursename: course.CategoryCourse ? course.CategoryCourse.name : null // Include category name if available
      }
    })

    // Wait for all promises to resolve and gather the data from the database
    const dataFromDatabase = await Promise.all(coursePromises)

    // Send the enriched course data back as a JSON response
    res.json({ data: dataFromDatabase })
  } catch (error) {
    // Log the error for debugging purposes
    console.error(error) // Consider replacing with a logging mechanism if available
    // Send an error response to the client
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message })
  }
})
/**
 * Get courses by categoryCourseId.
 *
 * This API retrieves a list of courses that belong to a specific category course.
 * It includes details such as the assigned user's name, course information, and category name.
 *
 * @author Quoc
 * @route GET /courses/category_courses/:categoryCourseId
 * @param {string} categoryCourseId - The ID of the category course.
 * @returns {Promise<Object>} A JSON object containing a list of courses in the specified category.
 */
router.get('/category_courses/:categoryCourseId', async (req, res) => {
  const { categoryCourseId } = req.params // Extract categoryCourseId from the URL parameters

  try {
    // Find all courses that match the categoryCourseId
    const listCourses = await models.Course.findAll({
      where: { categoryCourseId }, // Filter by the provided categoryCourseId
      include: [models.CategoryCourse], // Include the CategoryCourse model to access the category name
      order: [['id', 'DESC']] // Order courses by descending ID (latest first)
    })

    // Map over the list of courses to construct the detailed course information
    const coursePromises = listCourses.map(async (course) => {
      let username = null // Initialize the username as null

      // If the course is assigned to a user, find the user by their ID
      if (course.assignedBy) {
        const author = await models.User.findByPk(course.assignedBy, {
          attributes: ['username'] // Only retrieve the username
        })
        if (author) {
          username = author.username // If the author exists, set the username
        }
      }

      // Return the detailed course information in a structured format
      return {
        id: course.id,
        name: course.name,
        summary: course.summary,
        assignBy: username, // The username of the person who assigned the course (if available)
        durationInMinute: course.durationInMinute,
        startDate: course.startDate,
        endDate: course.endDate,
        locationPath: course.locationPath,
        description: course.description,
        price: course.price,
        prepare: course.prepare,
        categoryCoursename: course.CategoryCourse ? course.CategoryCourse.name : null // The category name (if available)
      }
    })

    // Await all promises to complete before sending the response
    const dataFromDatabase = await Promise.all(coursePromises)

    // Return the data in JSON format
    res.json({ data: dataFromDatabase })
  } catch (error) {
    console.error(error) // Optionally replace with logError(req, error) for proper logging
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message }) // Send a 500 error response if something goes wrong
  }
})

/**
 * Get the full name of an author by the uploadedBy user ID.
 *
 * This API retrieves the first and last name of the user who uploaded the content.
 * It constructs the full name from these attributes and returns it.
 *
 * @author Quoc
 * @param {string} uploadedBy - The ID of the user who uploaded the content.
 * @returns {Promise<Object>} A JSON object containing the author's full name.
 */
router.get('/get-author/:uploadedBy', async (req, res) => {
  const { uploadedBy } = req.params // Extract the uploadedBy ID from the URL parameters
  console.log('check uploadedBy:___________', uploadedBy) // Log for debugging purposes

  try {
    // Find the user by their primary key (uploadedBy)
    const author = await models.User.findByPk(uploadedBy, {
      attributes: ['firstName', 'lastName'] // Only retrieve first and last name
    })

    // Check if the user exists
    if (!author) {
      return res.status(404).json({ message: 'Author not found' }) // Return 404 if user not found
    }

    // Construct the full name from first and last name
    const fullName = `${author.firstName} ${author.lastName}`

    // Log the full name for debugging or tracking (optional)
    // logInfo(req, fullName)

    // Return the full name as a JSON response
    res.json({ fullName })
  } catch (err) {
    // Log the error (optional)
    // logError(req, err)

    // Log the error to the console and return a 500 status code
    console.error(err)
    res.status(500).json({ message: 'Failed to fetch author information' }) // Return a general error message
  }
})

/**
 * Get detailed information about a course by ID.
 *
 * @author Quoc
 * @route GET /courses/:id
 * @param {string} id - ID of the course.
 * @returns {Promise<Object>} A JSON object containing detailed information about the course.
 */
router.get('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params // Extract the ID from the URL parameters
    // Find the course by ID
    const course = await models.Course.findByPk(id)

    // FIX: moved the not-found check before accessing course.toJSON() to avoid
    // a TypeError crash when course is null
    if (!course) {
      return res.status(404).json({ message: 'Course not found' }) // Send a 404 response if the course is not found
    }

    // Get the course categories
    const categoryCourse = await getCourseCategory()
    // Create a response object with course information and category name
    const response = {
      ...course.toJSON(), // Convert the course object to JSON
      categoryCourseName: categoryCourse?.find((e) => course.categoryCourseId === e.id)?.name ?? null // Find the category name for the course
    }

    // Log access information
    infoLogger.info({
      message: `Accessed ${req.path}`,
      method: req.method,
      endpoint: req.path,
      request: req.params,
      response: course,
      user: req.user.id
    })

    // Send JSON response with course information
    res.json(response)
  } catch (error) {
    // Log the error
    logError(req, error)
    // Send an error response
    res.status(500).json({ message: 'Failed to fetch course', error: error.message })
  }
})
const MESSAGES6 = {
  COURSE_NOT_FOUND: 'Course not found.',
  DELETED_COURSE: 'Deleted Course.',
  CANNOT_DELETE_COURSE: 'Cannot delete course due to existing references.',
  INTERNAL_SERVER_ERROR: 'Internal Server Error.'
}

/**
 * Delete a course by ID.
 *
 * This API deletes a course, along with any associated lessons and progress.
 * It also removes the course image file from the file system.
 *
 * @author Quoc
 * @route DELETE /courses/:id
 * @param {string} id - ID of the course to be deleted.
 * @returns {Promise<Object>} A JSON object confirming the deletion or an error message.
 */
router.delete('/:id', isAuthenticated, async (req, res) => {
  try {
    const { id } = req.params // Extract the ID from the URL parameters

    // Find the course by ID
    const course = await models.Course.findByPk(id)

    // Check if the course exists
    if (!course) {
      // Log error if the course is not found
      logError(req, MESSAGES6.COURSE_NOT_FOUND)
      return res.status(404).json({ message: MESSAGES6.COURSE_NOT_FOUND }) // Send a 404 response if the course is not found
    }

    // Path to the image file
    const imagePath = path.resolve(__dirname, '../uploads/courses/', course.locationPath)

    // Delete related lessons and course progress (commented out but can be activated if necessary)
    // await models.Lession.destroy({ where: { courseId: id } })
    // await models.CourseProgress.destroy({ where: { courseId: id } })

    // Delete the course
    await course.destroy()

    // Delete the image file if it exists
    fs.unlink(imagePath, (err) => {
      if (err) {
        // Log error if image file deletion fails
        console.error('Failed to delete image file:', err)
      } else {
        console.log('Image file deleted:', imagePath) // Confirm image deletion
      }
    })

    // Send JSON response confirming the deletion of the course
    res.json({ message: MESSAGES6.DELETED_COURSE })

    // Log the course information after successful deletion
    logInfo(req, course)
  } catch (error) {
    // Handle foreign key constraint error
    if (error.name === 'SequelizeForeignKeyConstraintError') {
      // Log the error and return a conflict status
      logInfo(req, error)
      return res.status(409).json({ message: MESSAGES6.CANNOT_DELETE_COURSE })
    }

    // Log and return a 500 response for any other errors
    logError(req, MESSAGES6.INTERNAL_SERVER_ERROR)
    res.status(500).json({ message: MESSAGES6.INTERNAL_SERVER_ERROR })
  }
})
const MESSAGES4 = {
  COURSE_NOT_FOUND: 'Course not found.',
  INTERNAL_SERVER_ERROR: 'Please select a course category.',
  DUPLICATE_COURSE_NAME: 'Course name already exists.',
  INVALID_INPUT_ASSIGNEDBY: 'assignedBy must be a number',
  INVALID_INPUT_PRICE: 'price must be a number',
  INVALID_INPUT_durationInMinute: 'durationInMinute must be a number',
  EMPTY_NAME: 'Name field cannot be empty.',
  EMPTY_ASSIGNED_BY: 'Assigned by field cannot be empty.',
  EMPTY_CATEGORY_COURSE_ID: 'Category course ID field cannot be empty.',
  INVALID_DURATION: 'Duration must be a number greater than 0.',
  INVALID_PRICE: 'Price must be a number greater than 0.',
  INVALID_DATE: 'End date must be later than start date.',
  INVALID_ASSIGNED_BY: 'Assigned by field must be a valid number.',
  FILE_TOO_LARGE: 'File size exceeds the limit of 5MB.'
}
/**
 * Updates an existing course with the provided data.
 * Handles file uploads, validation, and updating the course in the database.
 *
 * @author Quoc
 * @route PUT / courses/:id
 * @param {string} id - The ID of the course to be updated.
 * @returns {Promise<Object>} The updated course object, or an error message if validation fails.
 */
router.put('/:id', (req, res, next) => {
  // Handle file upload with multer
  upload.single('locationPath')(req, res, function (err) {
    // Check for multer-specific errors like file size limit
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: MESSAGES4.FILE_TOO_LARGE })
      }
      return res.status(500).json({ message: MESSAGES4.INTERNAL_SERVER_ERROR })
    } else if (err) {
      return res.status(500).json({ message: MESSAGES4.INTERNAL_SERVER_ERROR })
    }
    next() // Proceed to the next middleware if no errors
  })
}, async (req, res) => {
  try {
    const { id } = req.params // Extract course ID from the route parameters
    const {
      name,
      summary,
      assignedBy,
      durationInMinute,
      startDate,
      endDate,
      description,
      prepare,
      categoryCourseId,
      publicStatus, // New field
      publicDate // New field
    } = req.body // Extract course details from the request body

    const file = req.file // Get the uploaded file, if any

    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: MESSAGES4.EMPTY_NAME })
    }
    if (!assignedBy) {
      return res.status(400).json({ message: MESSAGES4.EMPTY_ASSIGNED_BY })
    }
    if (!categoryCourseId) {
      return res.status(400).json({ message: MESSAGES4.EMPTY_CATEGORY_COURSE_ID })
    }

    // Validate assignedBy (should be a valid number and positive)
    if (isNaN(assignedBy)) {
      return res.status(400).json({ message: MESSAGES4.INVALID_INPUT_ASSIGNEDBY })
    }
    if (Number(assignedBy) <= 0) {
      return res.status(400).json({ message: MESSAGES4.INVALID_ASSIGNED_BY })
    }

    // Validate durationInMinute (must be a number and positive)
    if (isNaN(durationInMinute)) {
      return res.status(400).json({ message: MESSAGES4.INVALID_DURATION })
    }
    if (Number(durationInMinute) <= 0) {
      return res.status(400).json({ message: MESSAGES4.INVALID_DURATION })
    }

    // Validate that end date is after the start date
    if (new Date(endDate) <= new Date(startDate)) {
      return res.status(400).json({ message: MESSAGES4.INVALID_DATE })
    }

    // Find the course to update by its ID
    const course = await models.Course.findByPk(id)
    if (!course) {
      return res.status(404).json({ message: MESSAGES4.COURSE_NOT_FOUND })
    }

    // Check if another course with the same name exists (except the current one)
    const existingCourse = await models.Course.findOne({ where: { name, id: { [Op.ne]: id } } })
    if (existingCourse) {
      if (req.file) {
        fs.unlinkSync(req.file.path) // Delete the uploaded file if course name is duplicated
      }
      return res.status(400).json({ message: MESSAGES4.DUPLICATE_COURSE_NAME })
    }

    // If a new file is uploaded, remove the old file
    if (course.locationPath && file) {
      const oldFilePath = path.resolve(finalDir, course.locationPath)
      try {
        fs.unlinkSync(oldFilePath) // Delete the old image
        console.log(`Deleted old image: ${oldFilePath}`)
      } catch (err) {
        console.error(`Error deleting old image: ${oldFilePath}`, err)
      }
    }

    // Use the new file's path or retain the old path if no new file is uploaded
    const locationPath = file ? file.filename : course.locationPath

    // Update course fields with new values
    course.name = name
    course.summary = summary
    course.assignedBy = assignedBy
    course.durationInMinute = durationInMinute
    course.startDate = startDate
    course.endDate = endDate
    course.description = description
    course.prepare = prepare
    course.categoryCourseId = categoryCourseId
    course.locationPath = locationPath // Updated file path if a new file was uploaded
    course.publicStatus = publicStatus // Update new field
    course.publicDate = publicDate // Update new field

    // Save the updated course in the database
    await course.save()

    // Move the new file to its final destination if it was uploaded
    if (file) {
      const finalPath = path.join(finalDir, file.filename)
      fs.renameSync(file.path, finalPath) // Move the file to the final directory
    }

    // Respond with the updated course object
    res.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    // If an error occurs, delete the uploaded file to avoid leaving unused files
    if (req.file) {
      fs.unlinkSync(req.file.path)
    }
    // Send internal server error response
    res.status(500).json({ message: MESSAGES4.INTERNAL_SERVER_ERROR })
  }
})
const tempDir = path.resolve(__dirname, '../uploads/courses/') // Define the temporary directory path for uploaded course images
const finalDir = path.resolve(__dirname, '../uploads/courses/') // Define the final directory path for course images (currently the same as tempDir)

// Ensure the temporary directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true }) // Create the temporary directory if it does not exist
}

// Configure multer storage options for handling file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, tempDir) // Store file temporarily in the specified temporary directory
  },
  filename: function (req, file, cb) {
    cb(null, 'course_' + Date.now() + path.extname(file.originalname)) // Set a unique file name based on the current timestamp and the original file extension
  }
})

// Initialize multer with the defined storage options and set file size limits
const upload = multer({
  storage, // Use the configured storage settings
  limits: { fileSize: 5 * 1024 * 1024 } // Limit file size to 5MB (5 * 1024 * 1024 bytes)
})

// Check if the final directory exists
const dir = path.resolve(__dirname, '../uploads/courses/')
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir) // Create the final directory if it does not exist
  console.log('Directory created:', dir) // Log a message indicating that the directory was created
} else {
  console.log('Directory already exists:', dir) // Log a message if the directory already exists
}
console.log('Absolute path:', dir) // Log the absolute path of the directory

/**
 * Uploads a file and creates a new course with the provided details.
 * Handles file size limitations and validates course data before saving.
 *
 * @author Quoc
 * @route POST / courses/
 * @returns {Promise<Object>} The newly created course object, or an error message if validation fails or a conflict occurs.
 */
router.post('/', (req, res, next) => {
  // Handle file upload with multer
  upload.single('file')(req, res, (err) => {
    // Check for multer-specific errors
    if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ message: 'File size exceeds the limit of 5MB' })
    } else if (err) {
      return res.status(400).json({ message: err.message })
    }
    // Proceed to the next middleware if no errors occurred
    next()
  })
}, async (req, res) => {
  try {
    console.log('File upload request received')

    // Destructure relevant fields from the request body
    const {
      categoryCourseId,
      name,
      summary,
      assignedBy,
      durationInMinute,
      startDate,
      endDate,
      description,
      prepare,
      price,
      publicStatus,
      publicDate
    } = req.body

    // Validate categoryCourseId
    if (!categoryCourseId) {
      return res.status(400).json({ message: MESSAGES.BAD_REQUEST_CATEGORY_COURSE_ID })
    }
    // Validate name
    if (!name) {
      return res.status(400).json({ message: MESSAGES.BAD_REQUEST_NAME })
    }

    // Check if assignedBy is a valid user ID
    const user = await models.User.findByPk(assignedBy)
    if (!user) {
      return res.status(400).json({ message: MESSAGES.BAD_REQUEST_ASSIGNED_BY })
    }

    // Check if a course with the same name already exists
    const existingCourse = await models.Course.findOne({ where: { name } })
    if (existingCourse) {
      // If a file was uploaded, delete the temporary file
      if (req.file) {
        fs.unlinkSync(req.file.path) // Delete the temporary file
      }
      return res.status(409).json({ message: MESSAGES.CONFLICT_NAME_EXISTS })
    }

    // Get the path of the uploaded file, if it exists
    const locationPath = req.file ? req.file.filename : null

    // Create a new course in the database
    const course = await models.Course.create({
      categoryCourseId,
      name,
      summary,
      assignedBy,
      durationInMinute,
      startDate,
      endDate,
      description,
      locationPath, // Store the filename of the uploaded file
      prepare,
      price, // Ensure price is saved correctly
      publicStatus,
      publicDate
    })

    // Move the uploaded file to its final destination, if it exists
    if (req.file) {
      const finalPath = path.join(finalDir, req.file.filename)
      fs.renameSync(req.file.path, finalPath) // Move file to final destination
    }

    // Send notification to all users if notifyUsers is true
    if (req.body.notifyUsers === true || req.body.notifyUsers === 'true') {
      try {
        // Only send notification if publicStatus is not 0 (draft)
        if (Number(publicStatus) !== 0) {
          // Get all users from database
          const allUsers = await models.User.findAll({
            attributes: ['id']
          })

          // Prepare notification message and URL based on publicStatus
          let urlMessage = ''
          let notificationMessage = ''

          if (Number(publicStatus) === 2) {
            // Published now - immediate notification
            urlMessage = `/courses/${course.id}`
            notificationMessage = `"${course.name}"`
          } else if (Number(publicStatus) === 1) {
            // Scheduled - notification with date
            const formattedDate = publicDate
              ? new Date(publicDate).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
              })
              : ''
            // Add date to message for scheduled courses using | separator
            notificationMessage = `"${course.name}"|${formattedDate}`
          }

          // Create notification with bilingual support
          // Frontend will handle the translation based on 'title' field
          const notification = await models.Notification.create({
            title: 'New Course',
            message: notificationMessage,
            url: urlMessage
          })

          // Create notification recipients for all users
          const notificationRecipients = allUsers.map(user => ({
            notificationId: notification.id,
            userId: user.id,
            status: false // unread
          }))

          await models.NotificationRecipient.bulkCreate(notificationRecipients)
        }
      } catch (notificationError) {
        console.error('Error sending notifications:', notificationError)
        // Don't fail the course creation if notification fails
      }
    }

    // Respond with the newly created course object
    res.json(course)
  } catch (error) {
    console.error('Error uploading file:', error)
    // If an error occurs, delete the temporary file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path) // Delete the temporary file
    }
    res.status(500).json({ message: MESSAGES.INTERNAL_SERVER_ERROR })
  }
})

const MESSAGES = {
  BAD_REQUEST_CATEGORY_COURSE_ID: 'categoryCourseId cannot be empty',
  BAD_REQUEST_NAME: 'name cannot be empty',
  BAD_REQUEST_ASSIGNED_BY: 'The assignedBy value must correspond to an existing user ID',
  BAD_REQUEST_DATE_TYPE: 'startDate and endDate must be integers',
  CONFLICT_NAME_EXISTS: 'A course with this name already exists',
  INTERNAL_SERVER_ERROR: 'Internal Server Error'
}
