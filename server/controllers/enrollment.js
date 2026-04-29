/* eslint-disable no-unused-vars */
const express = require('express')
const { models } = require('../models')
const { isAuthenticated } = require('../middlewares/authentication')
const jsonError = 'Internal server error'
const router = express.Router()
const sequelize = require('../models/init')
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
 * Get notifications for user.
 *
 * @author Canh
 * @route GET /markAsComplete
 * @param {string} req.body.data.courseId - The ID of the course to be marked as complete.
 * @param {string} req.user.id - The ID of the authenticated user.
 * @returns {Promise<Object>} The response object containing a success message.
 */
router.post('/markAsComplete', isAuthenticated, async (req, res) => {
  try {
    // Extract courseId, userId from request
    const { courseId } = req.body.data
    const userId = req.user.id
    // Find the enrollment for the specified course and user
    const enrollment = await models.Enrollment.findOne({ where: { userId, courseId } })
    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' })
    }
    // Update the enrollment status and completion date
    enrollment.completedDate = new Date()
    enrollment.status = true
    await enrollment.save()
    // Log the success message and send the response
    logInfo(req, { message: 'Course marked as complete' })
    return res.status(200).json({ message: 'Course marked as complete' })
  } catch (error) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, error)
    return res.status(500).json({ error: jsonError })
  }
}
)
/**
 * Get paginated dashboard data.
 *
 * @author Canh
 * @route GET /dashboard
 * @param {string} [req.query.page] - The page number for pagination (default is 1).
 * @param {string} [req.query.size] - The number of records per page for pagination (default is 5).
 * @param {string} [req.query.userSearch] - The search term for filtering users by full name or email.
 * @param {string} [req.query.courseSearch] - The search term for filtering courses by name (JSON array).
 * @param {string} [req.query.groupSearch] - The search term for filtering groups by name (JSON array).
 * @returns {Promise<Object>} The response object containing paginated dashboard data.
 */
router.get('/dashboard', isAuthenticated, async (req, res) => {
  try {
    // Extract pagination parameters from request query
    const page = parseInt(req.query.page, 10) || 1
    const size = parseInt(req.query.size, 10) || 5
    const offset = (page - 1) * size
    // Extract search parameters from request query
    const userSearch = req.query.userSearch ? `%${req.query.userSearch}%` : null
    const courseSearch = req.query.courseSearch ? JSON.parse(req.query.courseSearch).map(name => `%${name}%`) : null
    const groupSearch = req.query.groupSearch ? JSON.parse(req.query.groupSearch).map(name => `%${name}%`) : null
    // Initialize where clauses and replacements for SQL query
    const whereClauses = []
    const replacements = { size, offset }
    // Add user search condition if provided
    if (userSearch) {
      whereClauses.push(`(
        CONCAT_WS(' ', COALESCE(u.firstName, ''), COALESCE(u.lastName, '')) LIKE :userSearch
        OR u.email LIKE :userSearch
      )`)
      replacements.userSearch = userSearch
    }
    // Add course search condition if provided
    if (courseSearch && courseSearch.length > 0) {
      const courseCondition = `
        EXISTS (
          SELECT 1 FROM courses c
          JOIN enrollments e2 ON e2.courseId = c.id
          WHERE e2.userId = u.id AND (${courseSearch.map((_, index) => `c.name LIKE :courseName${index}`).join(' OR ')}) AND e2.status = true
        )
      `
      whereClauses.push(courseCondition)
      courseSearch.forEach((course, index) => {
        replacements[`courseName${index}`] = course
      })
    }
    // Add group search condition if provided
    if (groupSearch && groupSearch.length > 0) {
      const groupCondition = `
        (${groupSearch.map((_, index) => `g.name LIKE :groupName${index}`).join(' OR ')})
      `
      whereClauses.push(groupCondition)
      groupSearch.forEach((group, index) => {
        replacements[`groupName${index}`] = group
      })
    }
    // Combine where clauses into a single SQL where clause
    const whereClause = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''
    // Query to get the total number of records
    const totalRecordsQuery = await sequelize.query(`
      SELECT COUNT(DISTINCT u.id) AS totalRecords
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.userId
      LEFT JOIN \`groups\` g ON u.groupId = g.id
      ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    })
    // Calculate total pages based on total records and page size
    const totalRecords = totalRecordsQuery[0].totalRecords
    const totalPages = Math.ceil(totalRecords / size)
    // Query to get the paginated data
    const paginatedDataQuery = await sequelize.query(`
      SELECT
        u.id AS userId,
        u.email AS email,
        CONCAT_WS(' ', u.firstName, u.lastName) AS name,
        g.name AS groupName,
        JSON_ARRAYAGG(
          CASE WHEN e.status = true THEN JSON_OBJECT('courseId', c.id, 'courseName', c.name) ELSE NULL END
        ) AS courseDones,
        COUNT(CASE WHEN e.status = true THEN 1 ELSE NULL END) as coursesCount
      FROM users u
      LEFT JOIN enrollments e ON u.id = e.userId
      LEFT JOIN courses c ON e.courseId = c.id AND e.status = true
      LEFT JOIN \`groups\` g ON u.groupId = g.id
      ${whereClause}
      GROUP BY u.id
      LIMIT :size OFFSET :offset
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    })
    // Log the access to the dashboard
    logInfo(req, { message: 'Dashboard accessed' })
    // Send the response with paginated data
    res.json({
      currentPage: page,
      pageSize: size,
      totalPages,
      totalRecords,
      data: paginatedDataQuery.map(record => ({
        ...record,
        courseDones: record.courseDones.filter(course => course !== null)
      }))
    })
  } catch (err) {
    // Log the error and send a 500 Internal Server Error response
    logError(req, err)
    console.error(err.message)
    res.status(500).send('Server error')
  }
})

module.exports = router
