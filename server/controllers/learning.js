const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const { infoLogger, errorLogger } = require('../logs/logger')

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
 * Get category lessons by course ID.
 *
 * @author Canh
 * @route GET /getCategoryLessionsByCourse/:courseId
 * @param {string} req.params.courseId - The ID of the course to fetch category lessons for.
 * @returns {Promise<Object>} The response object containing the list of category lessons.
 */
router.get('/getCategoryLessionsByCourse/:courseId', isAuthenticated, async (req, res) => {
  // Extract courseId from request parameters
  const { courseId } = req.params
  try {
    // Retrieve all category lessons associated with the specified course ID
    const categoryLessions = await models.CategoryLession.findAll({
      where: {
        courseId
      }
    })
    // Log the retrieved category lessons for debugging purposes
    logInfo(req, categoryLessions)
    // Send the response with the list of category lessons
    res.json(categoryLessions)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get lessons by category ID.
 *
 * @author Canh
 * @route GET /getLessionByCategory/:lessionCategoryId
 * @param {string} req.params.lessionCategoryId - The ID of the lesson category to fetch lessons for.
 * @returns {Promise<Object>} The response object containing the list of lessons.
 */
router.get('/getLessionByCategory/:lessionCategoryId', isAuthenticated, async (req, res) => {
  // Extract lessionCategoryId from request parameters

  const { lessionCategoryId } = req.params

  try {
    // Retrieve all lessons associated with the specified lesson category ID
    const lessions = await models.Lession.findAll({
      where: {
        lessionCategoryId
      }
    })
    // Log the retrieved lessons for debugging purposes
    logInfo(req, lessions)
    // Send the response with the list of lessons
    res.json(lessions)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Add a new enrollment.
 *
 * @author Canh
 * @route POST /addEnrollment
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {string} req.body.data - The ID of the course to enroll in.
 * @returns {Promise<Object>} The response object containing the created enrollment.
 */
router.post('/addEnrollment', isAuthenticated, async (req, res) => {
  // Extract the authenticated user's ID and course ID from the request
  const loginedUserId = req.user.id
  const courseId = req.body.data
  try {
    // Create a new enrollment for the authenticated user in the specified course
    const newEnrollment = await models.Enrollment.create({
      courseId,
      userId: loginedUserId,
      enrollment_date: new Date()
    })
    // Log the created enrollment for debugging purposes
    logInfo(req, newEnrollment)
    // Send the response with the created enrollment
    res.json(newEnrollment)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get enrollment by course ID.
 *
 * @author Canh
 * @route GET /getEnrollmentByCourseId/:courseId
 * @param {string} req.user.id - The ID of the authenticated user.
 * @param {string} req.params.courseId - The ID of the course to fetch enrollment details for.
 * @returns {Promise<Object>} The response object containing the enrollment details.
 */
router.get('/getEnrollmentByCourseId/:courseId', isAuthenticated, async (req, res) => {
  // Extract the authenticated user's ID and course ID from the request

  const loginedUserId = req.user.id
  const courseIdData = req.params.courseId
  try {
    // Retrieve the enrollment details for the authenticated user in the specified course
    const enrollment = await models.Enrollment.findOne({ where: { courseId: courseIdData, userId: loginedUserId } })
    // Log the retrieved enrollment details for debugging purposes
    logInfo(req, enrollment)
    // Send the response with the enrollment details
    res.json(enrollment)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get enrollments by user ID.
 *
 * @author Canh
 * @route GET /getEnrollmentByCourseId/:courseId
 * @param {string} req.user.id - The ID of the authenticated user.
 * @returns {Promise<Object>} The response object containing the enrollment details.
 */
router.get('/getEnrollmentByUserId', isAuthenticated, async (req, res) => {
  try {
    // Extract the authenticated user's ID from the request
    const loginedUserId = req.user.id
    // Retrieve all enrollments associated with the authenticated user's ID
    const enrollments = await models.Enrollment.findAll({ where: { userId: loginedUserId } })
    // Log the retrieved enrollments for debugging purposes
    logInfo(req, enrollments)
    // Send the response with the list of enrollments
    res.json(enrollments)
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Get course progress by enrollment ID.
 *
 * @author Canh
 * @route GET /getProgressByEnrollmentId/:enrollmentId
 * @param {string} req.params.enrollmentId - The ID of the enrollment to fetch course progress for.
 * @returns {Promise<Object>} The response object containing the course progress data.
 */
router.get('/getProgressByEnrollmentId/:enrollmentId', isAuthenticated, async (req, res) => {
  try {
    // Extract enrollmentId from request parameters
    const enrollmentId = req.params.enrollmentId
    // Retrieve the course progress associated with the specified enrollment ID
    const courseProgress = await models.CourseProgress.findAll({ where: { enrollmentId } })
    // Log the retrieved course progress for debugging purposes
    logInfo(req, courseProgress)
    // Send the response with the course progress data
    res.status(200).json({ data: courseProgress })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})
/**
 * Add progress for a lesson.
 *
 * @author Canh
 * @route POST /addProgress
 * @param {string} req.body.data.enrollmentId - The ID of the enrollment.
 * @param {string} req.body.data.lessionId - The ID of the lesson.
 * @returns {Promise<Object>} The response object containing the added progress or an error message.
 */
router.post('/addProgress', isAuthenticated, async (req, res) => {
  try {
    // Extract enrollmentId and lessionId from request body
    const { enrollmentId, lessionId } = req.body.data
    // Check if progress already exists for the given enrollmentId and lessionId
    const existingProgress = await models.CourseProgress.findOne({
      where: {
        enrollmentId,
        lessionId
      }
    })
    // If progress already exists, return a 400 error with the existing progress data
    if (existingProgress) {
      console.log('Learn again')
      return res.status(400).json({ data: existingProgress })
    }
    // Create new progress for the given enrollmentId and lessionId
    const newProgress = await models.CourseProgress.create({
      enrollmentId,
      lessionId,
      completion_at: null
    })
    // If creating new progress fails, return a 400 error
    if (!newProgress) {
      return res.status(400).json({ message: 'Failed to add progress' })
    }
    // Log the new progress for debugging purposes
    logInfo(req, newProgress)
    // Retrieve the courseId associated with the enrollmentId
    const enrollment = await models.Enrollment.findOne({
      where: { id: enrollmentId },
      attributes: ['courseId']
    })
    // Retrieve all category lessons associated with the courseId
    const categoryLessions = await models.CategoryLession.findAll({
      where: { courseId: enrollment.courseId },
      attributes: ['id']
    })
    // Calculate the total number of lessons in the course
    let totalLessons = 0
    for (const categoryLession of categoryLessions) {
      const lessonCount = await models.Lession.count({
        where: { lessionCategoryId: categoryLession.id }
      })
      totalLessons += lessonCount
    }
    // Increment the progress of the enrollment by the fraction of the total lessons
    await models.Enrollment.increment('progress', { by: 1 / totalLessons, where: { id: enrollmentId } })
    // Send the response with the new progress data
    res.status(200).json({ data: newProgress })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    res.status(500).json({ message: jsonError })
  }
})

module.exports = router
